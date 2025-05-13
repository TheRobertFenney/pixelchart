use spacetimedb::{
    table,
    reducer,
    Table,
    Identity,
    Timestamp,
    ReducerContext,
};
use log;

// Constants
const GRID_SIZE: u32 = 32;

// Track connected users
#[table(name = connected_user)]
pub struct ConnectedUser {
    #[primary_key]
    identity: Identity,
    connected_at: Timestamp,
}

// Lifecycle Handlers
#[reducer(init)]
pub fn init(_ctx: &ReducerContext) {
    log::info!("Module initialized");
}

#[reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    // Add to connected users
    ctx.db.connected_user().insert(ConnectedUser {
        identity: ctx.sender,
        connected_at: ctx.timestamp,
    });

    // Update user's last active timestamp if they exist
    if let Some(mut user) = ctx.db.user().identity().find(&ctx.sender) {
        user.last_active = ctx.timestamp;
        ctx.db.user().identity().update(user);
        log::info!("User {:?} connected", ctx.sender);
    } else {
        log::info!("New client connected: {:?}", ctx.sender);
    }
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(ctx: &ReducerContext) {
    // Remove from connected users
    ctx.db.connected_user().identity().delete(&ctx.sender);

    if let Some(user) = ctx.db.user().identity().find(&ctx.sender) {
        log::info!("User {} disconnected", user.clerk_id);
    } else {
        log::info!("Client disconnected: {:?}", ctx.sender);
    }
}

#[table(name = pixel, public)]
pub struct Pixel {
    #[primary_key]
    position: u32,  // y * GRID_SIZE + x
    color: String,  // hex color
    last_modified_by: Identity,
    timestamp: Timestamp,
}

// Enhanced User table with Clerk metadata
#[table(name = user, public)]
pub struct User {
    #[primary_key]
    identity: Identity,
    clerk_id: String,         // Clerk's user ID
    email: Option<String>,    // User's email from Clerk
    username: Option<String>, // Username from Clerk
    last_active: Timestamp,
}

#[table(name = admin)]
pub struct Admin {
    #[primary_key]
    identity: Identity,
}

// Initialize or update user from Clerk data
#[reducer]
pub fn sync_clerk_user(
    ctx: &ReducerContext,
    clerk_id: String,
    email: Option<String>,
    username: Option<String>,
) -> Result<(), String> {
    // Validate inputs
    if clerk_id.is_empty() {
        return Err("Clerk ID cannot be empty".to_string());
    }

    // Check if user exists
    if let Some(mut existing_user) = ctx.db.user().identity().find(&ctx.sender) {
        // Update existing user
        existing_user.clerk_id = clerk_id.clone();
        existing_user.email = email.or(existing_user.email);
        existing_user.username = username.or(existing_user.username);
        existing_user.last_active = ctx.timestamp;
        
        ctx.db.user().identity().update(existing_user);
    } else {
        // Create new user
        ctx.db.user().insert(User {
            identity: ctx.sender,
            clerk_id: clerk_id.clone(),
            email,
            username,
            last_active: ctx.timestamp,
        });
    }

    log::info!(
        "Synced Clerk user {} with SpacetimeDB identity {:?}",
        clerk_id,
        ctx.sender
    );
    Ok(())
}

// Add an admin (can only be called by existing admins)
#[reducer]
fn add_admin(ctx: &ReducerContext, new_admin: Identity) -> Result<(), String> {
    // The first admin can be added by the module owner
    let is_first_admin = ctx.db.admin().iter().next().is_none();
    let is_caller_admin = ctx.db.admin().identity().find(&ctx.sender).is_some();

    if !is_first_admin && !is_caller_admin {
        log::warn!("Unauthorized add_admin attempt by user {:?}", ctx.sender);
        return Err("Unauthorized: Only admins can add other admins".to_string());
    }

    // Add the new admin
    ctx.db.admin().insert(Admin {
        identity: new_admin,
    });

    log::info!("Added new admin {:?} by user {:?}", new_admin, ctx.sender);
    Ok(())
}

// Remove an admin (can only be called by existing admins)
#[reducer]
fn remove_admin(ctx: &ReducerContext, admin_to_remove: Identity) -> Result<(), String> {
    // Check if caller is an admin
    if !ctx.db.admin().identity().find(&ctx.sender).is_some() {
        log::warn!("Unauthorized remove_admin attempt by user {:?}", ctx.sender);
        return Err("Unauthorized: Only admins can remove admins".to_string());
    }

    // Don't allow removing the last admin
    let admin_count = ctx.db.admin().iter().count();
    if admin_count <= 1 && ctx.db.admin().identity().find(&admin_to_remove).is_some() {
        return Err("Cannot remove the last admin".to_string());
    }

    // Remove the admin
    ctx.db.admin().identity().delete(&admin_to_remove);
    
    log::info!("Removed admin {:?} by user {:?}", admin_to_remove, ctx.sender);
    Ok(())
}

// Clear the entire grid (admin only)
#[reducer]
fn clear_grid(ctx: &ReducerContext) -> Result<(), String> {
    // Check if the user is an admin
    if !ctx.db.admin().identity().find(&ctx.sender).is_some() {
        log::warn!("Non-admin user {:?} attempted to clear grid", ctx.sender);
        return Err("Unauthorized: Only admins can clear the grid".to_string());
    }

    log::info!("Clearing entire grid by admin {:?}", ctx.sender);
    // Since there's no clear() method, we'll delete all pixels
    for pixel in ctx.db.pixel().iter() {
        ctx.db.pixel().position().delete(&pixel.position);
    }
    Ok(())
}

// View the grid state at a specific timestamp (read-only)
#[reducer]
pub fn view_at_time(ctx: &ReducerContext, target_timestamp: Timestamp) -> Result<(), String> {
    // Get pixels that existed at or before the target timestamp
    let pixels: Vec<(u32, String)> = ctx.db.pixel()
        .iter()
        .filter(|pixel| pixel.timestamp <= target_timestamp)
        .map(|pixel| (pixel.position, pixel.color.clone()))
        .collect();

    // Log the result since we can't return it directly
    log::info!("Grid state at timestamp {:?}: {:?}", target_timestamp, pixels);
    Ok(())
}

// Unified paint reducer that handles both single and multiple pixels
// Note: This only modifies current state, never historical
#[reducer]
pub fn paint(ctx: &ReducerContext, positions: Vec<u32>, color: Option<String>) {
    // Early return if no positions to update
    if positions.is_empty() {
        return;
    }

    // Ensure user exists and is connected
    if ctx.db.user().identity().find(&ctx.sender).is_none() {
        log::warn!("Unknown user {:?} attempted to paint", ctx.sender);
        return;
    }

    if ctx.db.connected_user().identity().find(&ctx.sender).is_none() {
        log::warn!("Disconnected user {:?} attempted to paint", ctx.sender);
        return;
    }

    // Log the paint operation for debugging
    log::debug!(
        "Painting {} pixels with color {:?} by user {:?}",
        positions.len(),
        color,
        ctx.sender
    );

    // Update user's last active timestamp once per batch
    if let Some(mut user) = ctx.db.user().identity().find(&ctx.sender) {
        user.last_active = ctx.timestamp;
        ctx.db.user().identity().update(user);
    }

    // Process all positions in the batch - only affects current state
    for position in positions {
        if position >= GRID_SIZE * GRID_SIZE {
            log::warn!("Invalid position {} ignored", position);
            continue;
        }

        match color {
            Some(ref c) => {
                // Paint pixel in current state
                ctx.db.pixel().insert(Pixel {
                    position,
                    color: c.clone(),
                    last_modified_by: ctx.sender,
                    timestamp: ctx.timestamp,
                });
            }
            None => {
                // Clear pixel in current state
                if let Some(_) = ctx.db.pixel().position().find(&position) {
                    ctx.db.pixel().position().delete(&position);
                }
            }
        }
    }
} 
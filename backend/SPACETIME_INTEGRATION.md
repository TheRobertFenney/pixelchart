# PixelChart SpacetimeDB Integration

## Project Plan

### 1. Initial Setup (Mac Required)
```bash
# Install SpacetimeDB CLI
brew install clockworklabs/tap/spacetime

# Create new module
spacetime new pixelchart
```

### 2. Basic Module (src/lib.rs)
```rust
#[derive(Table)]
struct Pixel {
    #[primarykey]
    position: u32,  // y * GRID_SIZE + x
    color: String,  // hex color
    last_modified_by: Identity,
    timestamp: Timestamp
}

#[reducer]
fn paint_pixel(ctx: &ReducerContext, position: u32, color: String) {
    ctx.db.pixel.insert(Pixel {
        position,
        color,
        last_modified_by: ctx.sender,
        timestamp: ctx.timestamp
    });
}

#[reducer]
fn clear_pixel(ctx: &ReducerContext, position: u32) {
    if let Some(pixel) = ctx.db.pixel.position.find(position) {
        ctx.db.pixel.position.delete(position);
    }
}
```

### 3. Frontend Integration

1. Install SDK:
```bash
npm install @clockworklabs/spacetimedb-sdk
```

2. Create Connection (lib/spacetime.js):
```javascript
import { SpacetimeDBClient } from '@clockworklabs/spacetimedb-sdk';

export const client = new SpacetimeDBClient('your_module_address');

// Subscribe to updates
client.subscribe('Pixel', (pixels) => {
  // Update grid state with new pixels
});

// Functions to call reducers
export const paintPixel = (position, color) => {
  client.call('paint_pixel', [position, color]);
};

export const clearPixel = (position) => {
  client.call('clear_pixel', [position]);
};
```

### 4. Integration Points in Canvas Component

1. Update reducer to handle SpacetimeDB updates
2. Connect paint/clear operations to SpacetimeDB calls
3. Subscribe to updates from other users

### 5. Future Optimizations

After basic implementation is working, we can optimize:
- Implement run-length encoding for batch updates
- Add color compression
- Add history tracking
- Implement undo/redo
- Add user presence indicators

### 6. Deployment

1. Build module:
```bash
spacetime build
```

2. Deploy to SpacetimeDB cloud:
```bash
spacetime deploy pixelchart
```

### Notes

- GRID_SIZE is 32x32
- Each cell has a unique position = y * GRID_SIZE + x
- Keep initial implementation simple for teaching
- Test thoroughly with multiple users before optimization
- Monitor data usage in Maincloud dashboard

### Cost Considerations

- Free for development/testing
- Production costs ~$0.50/hr with current promotion
- Scales to zero when not in use
- Monitor usage through Maincloud dashboard 
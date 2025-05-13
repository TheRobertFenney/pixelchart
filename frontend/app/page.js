import Image from "next/image";
import ChartContainer from "@/components/chart-container";
import ProjectDescription from "@/components/project-description";

export default function Home() {
  return (
    <>
      {/* Main Content */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex flex-col items-center gap-8">
          {/* Title Section */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 text-white">PixelChart</h1>
            <p className="text-xl text-gray-300">Collaborative pixel art in real-time</p>
          </div>

          <ChartContainer />
        </div>
      </div>

      <ProjectDescription />
    </>
  );
}

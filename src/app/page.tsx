import { ExperienceLoader } from "@/components/ExperienceLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import { homeGraph } from "@/lib/structuredData";

export default function Home() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <ExperienceLoader />
    </>
  );
}

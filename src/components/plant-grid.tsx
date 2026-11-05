import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Botanical } from "./botanical";
import { plants } from "@/content/plants";
export function PlantGrid() {
  return (
    <div className="plant-grid">
      {plants.map((plant) => (
        <Link
          key={plant.slug}
          href={`/apple-trees/${plant.slug}`}
          className={`plant-card plant-${plant.slug}`}
        >
          <div className="plant-card-top">
            <span className="small-label">Apple selection</span>
            <span className="plant-number">{plant.number}</span>
          </div>
          <div className="plant-art">
            <Botanical variant={plant.slug === "gala" ? "branch" : "fruit"} />
          </div>
          <div className="plant-card-copy">
            <h3>{plant.name}</h3>
            <p>{plant.description}</p>
          </div>
          <div className="plant-card-bottom">
            <span>Explore this selection</span>
            <span className="plant-arrow">
              <ArrowUpRight size={22} aria-hidden="true" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

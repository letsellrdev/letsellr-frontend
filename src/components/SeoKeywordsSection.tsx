import { motion } from "framer-motion";
import { Search, TrendingUp, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const keywords = [
  { text: "Calicut rental homes", query: "calicut rental homes" },
  { text: "Kozhikode rent flat", query: "kozhikode rent flat" },
  { text: "Nadakkavu rent house", query: "nadakkavu rent house" },
  { text: "Beach Road Calicut apartments", query: "beach road calicut apartments" },
  { text: "Mavoor Road rent room", query: "mavoor road rent room" },
  { text: "Student room near Calicut University", query: "student room near calicut university" },
  { text: "Bachelors room Calicut", query: "bachelors room calicut" },
];

export const SeoKeywordsSection = () => {
  return (
    <div className="sr-only" aria-hidden="false">
      <section>
        <h2>Trending Rental Searches in Calicut & Kozhikode</h2>
        <p>
          Quickly find specialized accommodations in popular areas across Kozhikode. 
          Our platform offers verified listings for students, professionals, and families.
        </p>
        
        <ul>
          {keywords.map((item, idx) => (
            <li key={idx}>
              <Link to={`/search?query=${encodeURIComponent(item.query)}`}>
                {item.text} in Kozhikode, Kerala
              </Link>
            </li>
          ))}
        </ul>
        
        <div id="seo-description">
          <h3>Top properties and rental listings in Calicut</h3>
          <p>
            Looking for calicut rental homes or a kozhikode rent flat? Our platform offers the best nadakkavu rent house options and beach road calicut apartments. 
            Whether you need a mavoor road rent room or a student room near calicut university, or even a bachelors room calicut, we have verified listings for all.
          </p>
        </div>
      </section>
    </div>
  );
};

import Link from "next/link";
import {
  FaEnvelope,
  FaFacebook,
  FaLinkedin,
  FaMailBulk,
  FaMailchimp
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-blue-100 border-t mt-24">
      
      

      {/* Bottom */}
      <div className="border-t text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Navira. Tous droits réservés.
      </div>
    </footer>
  );
}

import Link from "next/link";
import { FaEnvelope, FaFacebook, FaLinkedin, FaMailBulk, FaMailchimp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-2">

        {/* Branding */}
        <div>
          <h3 className="text-xl font-bold mb-2">Code With Navira</h3>
          <p className="text-gray-600 text-sm">
            Après avoir beaucoup appris grâce à Internet, quoi de plus 
            naturel que de transmettre à mon tour ? Passionné par le 
            web depuis plus de 3 ans, j’aime partager mes compétences 
            et mes découvertes avec celles et ceux qui partagent cette même passion.
          </p>
        </div>

        {/* Formations */}
        <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h4 className="font-semibold mb-3">Frameworks</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Symfony</li>
            <li>React</li>
            <li>Next.js</li>
          </ul>
        </div>

        {/* Auth / Contact */}
        <div>
          <h4 className="font-semibold mb-3">Compte</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <a
                href="mailto:antonio@antonionavira.mg"
                className="hover:underline flex items-center gap-2"
              ><FaEnvelope className="text-grey-600 hover:text-grey-800" />
                Contact
              </a>
            </li>
            <li className="flex items-center gap-2"><a className="flex items-center gap-2" href="https://web.facebook.com/antonio.navira.9/"><FaFacebook className="text-grey-600 hover:text-grey-800" /> Facebook</a></li>
            <li className="flex items-center gap-2"><a className="flex items-center gap-2" href="https://www.linkedin.com/in/antonio-rollande-yves-andrianavalona-4753a7264/"><FaLinkedin className="text-grey-600 hover:text-grey-800" /> LinkedIn</a></li>
          </ul>
        </div>
      </div>
      </div>

      {/* Bottom */}
      <div className="border-t text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Navira. Tous droits réservés.
      </div>
    </footer>
  );
}

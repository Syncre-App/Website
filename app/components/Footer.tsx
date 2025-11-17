import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="mt-32 w-full border-t border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10 text-gray-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Syncre</p>
          <p className="text-lg font-semibold text-white mt-2">Conversations designed for quiet confidence.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-6">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="/remove-my-account" className="hover:text-white transition-colors">Remove my account</Link>
          <a href="mailto:info@syncre.xyz" className="hover:text-white transition-colors">info@syncre.xyz</a>
          <a href="https://github.com/Syncre-App" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <FaGithub className="text-xl" />
          </a>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Syncre. Built with care for private conversations.
      </div>
    </footer>
  );
};

export default Footer;

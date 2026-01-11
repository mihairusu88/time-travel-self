const footerLinks = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Contact Us', href: '/contact' },
]

export const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2024 HeroTime. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.map(link => (
              <a
                key={link.name}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                href={link.href}
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

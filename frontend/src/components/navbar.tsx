import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { NavLink, useNavigate } from "react-router-dom";
import './../style.css'

const navigation = [
  { name: 'Home', to: '/', current: true },
  { name: 'About', to: '/about', current: false },
  { name: 'Contact Us', to: '/contact', current: false },
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('token') // Check if user is logged in

  return (
    <Disclosure
      as="nav"
      className="relative bg-[#d69eec] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Mobile menu button */}
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-white/5 hover:text-white focus:outline-2 focus:-outline-offset-1 focus:outline-indigo-500">
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
              <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
            </DisclosureButton>
          </div>

          {/* Desktop menu links */}
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) =>
                      classNames(
                        isActive ? 'bg-white text-white' : 'text-blue-300 hover:bg-white-700 hover:text-white',
                        'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200'
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          </div>

          {/* Right side buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-2">
            {isLoggedIn ? (
              <button
                onClick={() => navigate('/post')}
                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition duration-200"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-purple-600 px-3 py-1 rounded hover:bg-purple-100 transition duration-200"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <DisclosurePanel className="sm:hidden">
        <div className="space-y-1 px-2 pt-2 pb-3">
          {navigation.map((item) => (
            <DisclosureButton
              key={item.name}
              as="a"
              href={item.to}
              aria-current={item.current ? 'page' : undefined}
              className={classNames(
                item.current ? 'bg-gray-950/50 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
                'block rounded-md px-3 py-2 text-base font-medium',
              )}
            >
              {item.name}
            </DisclosureButton>
          ))}

          {isLoggedIn ? (
            <DisclosureButton
              as="button"
              onClick={() => navigate('/post')}
              className="block w-full text-left bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition duration-200"
            >
              Dashboard
            </DisclosureButton>
          ) : (
            <>
              <DisclosureButton
                as="button"
                onClick={() => navigate('/login')}
                className="block w-full text-left bg-white text-purple-600 px-3 py-2 rounded hover:bg-purple-100 transition duration-200"
              >
                Login
              </DisclosureButton>
              <DisclosureButton
                as="button"
                onClick={() => navigate('/signup')}
                className="block w-full text-left bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 transition duration-200"
              >
                Sign Up
              </DisclosureButton>
            </>
          )}
        </div>
      </DisclosurePanel>
    </Disclosure>
  );
}

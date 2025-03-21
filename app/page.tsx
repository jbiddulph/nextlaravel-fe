import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return <>
    <div className="h-[100vh] flex flex-col justify-between">
      <section className="bg-indigo-600 text-white text-center py-10  h-[400px]">
          <div className="container mx-auto">
              <h1 className="text-8xl font-bold mt-12">Welcome to My Next.js App</h1>
              <p className="text-lg mt-4">Build amazing things with Next.js & Tailwind CSS</p>
              <Link href="/auth" className="inline-block bg-white text-indigo-600 font-semibold py-2 px-4 rounded mt-6">Get Started</Link>
          </div>
      </section>

      <section className="container mx-auto text-center my-10">
          <h2 className="text-6xl font-bold">Awesome Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="flex flex-col items-center">
                  <Image src="/file.svg" alt="Feature 1" width={120} height={120} />
                  <h4 className="text-2xl font-semibold mt-4">Fast Performance</h4>
                  <p className="text-gray-700 text-lg mt-2">Optimized for speed and efficiency.</p>
              </div>
              <div className="flex flex-col items-center">
                  <Image src="/window.svg" alt="Feature 2" width={120} height={120} />
                  <h4 className="text-2xl font-semibold mt-4">User Friendly</h4>
                  <p className="text-gray-700 text-lg mt-2">Intuitive and easy-to-use design.</p>
              </div>
              <div className="flex flex-col items-center">
                  <Image src="/globe.svg" alt="Feature 3" width={120} height={120} />
                  <h4 className="text-2xl font-semibold mt-4">SEO Ready</h4>
                  <p className="text-gray-700 text-lg mt-2">Boost your search rankings with SEO.</p>
              </div>
          </div>
      </section>

      <footer className="bg-gray-800 text-gray-300 text-center py-6 ">
          <p className="text-sm">© 2025 MyBrand. All rights reserved.</p>
      </footer>
    </div>
  </>
}

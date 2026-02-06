import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About this journal.',
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="font-typewriter text-4xl font-semibold text-ink dark:text-ink-light tracking-tight mb-8">
        About
      </h1>
      <div className="font-typewriter text-lg leading-[1.8] space-y-6 text-ink dark:text-ink-light">
        <p>
          Domininc, or Dom, as I call him, loves the summer. Unluckily, he was born in the UK, where the days are cloudy and grey, and the rain never stops. 
        </p>
        <p>
          He loves Letterboxd. He would probably start a Substack if he wasn't so afraid of being embarassed by the world. 
        </p>
        <p>
          So I made this for him! Im Jacky, and I was born in Macao - where the sun shines even in the middle of December. Winter doesn't really last long, and the days are always the same length. 
        </p>
        <p>
          But Jacky, I, am always so scared of time passing by. I'm always regretful of the fact that my parents are old and I am in the other side of the world. 
        </p>
        <p>
          This website is a way for us to just write down our thoughts of the day, or maybe even thoughts for our future, and for us one day, to look back on.
        </p>
      </div>
    </div>
  )
}

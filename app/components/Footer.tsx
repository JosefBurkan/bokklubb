export default function Footer() {
    return (
      <footer className="w-full bg-footer text-white">
  
        <div className="mx-auto w-full max-w-7xl px-6 py-12 md:px-8 lg:px-12">
  
          {/* =========================
              FOOTER CONTENT
          ========================= */}
  
          <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3">
  
            {/* =========================
                STORE
            ========================= */}
  
            <div>
              <h3 className="text-base font-bold">
                MERKATÅ BRUKTBUTIKK
              </h3>
  
              <p className="mx-auto mt-4 max-w-[300px] text-sm leading-6 text-white/65">
                Din lokale bruktbutikk med unike gjenstander,
                vintage, retro og brukte skatter.
              </p>
  
  
              {/* =========================
      SOCIAL MEDIA
  ========================= */}
  
  <div className="mt-6">
    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/70">
      Følg oss
    </p>
  
    <div className="flex items-center justify-center gap-4">
  
      {/* Instagram */}
      <a
        href="https://www.instagram.com/merkatabrukthandel/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Besøk Merkatå Bruktbutikk på Instagram"
        className="
          flex
          h-13
          w-13
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-white/5
          transition
          duration-200
  
          hover:-translate-y-1
          hover:border-brand
          hover:bg-brand
          hover:shadow-lg
        "
      >
        <img
          src="/instagram.svg"
          alt=""
          className="h-12 w-12 object-contain"
        />
      </a>
  
  
      {/* Facebook */}
      <a
        href="https://www.facebook.com/p/Merkat%C3%A5-bruktbutikk-100054623161104/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Besøk Merkatå Bruktbutikk på Facebook"
        className="
          flex
          h-13
          w-13
          items-center
          justify-center
          rounded-full
          border
          border-white/20
          bg-white/5
          transition
          duration-200
  
          hover:-translate-y-1
          hover:border-brand
          hover:bg-brand
          hover:shadow-lg
        "
      >
        <img
          src="/facebook.svg"
          alt=""
          className="h-12 w-12 object-contain"
        />
      </a>
  
    </div>
  </div>
            </div>
  
  
            {/* ========================= 
                OPENING HOURS
            ========================= */}
  
            <div>
  
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                Åpningstider
              </h3>
  
              <p className="mt-4 text-sm leading-6 text-white/65">
                Tir-Fre 11-18
                <br />
                Lør-Søn 12-18
              </p>
  
            </div>
  
  
            {/* =========================
                CONTACT
            ========================= */}
  
            <div>
  
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/90">
                Kontakt
              </h3>
  
              <p className="mt-4 text-sm leading-6 text-white/65">
                Schweigaards gate 92
                <br />
                0190 Oslo
                <br />
                97 40 65 89
              </p>
  
            </div>
  
          </div>
  
  
          {/* =========================
              FOOTER BOTTOM
          ========================= */}
  
          <div className="mt-10 border-t border-white/10 pt-6">
  
            <div className="flex flex-col items-center justify-center gap-2 text-center text-xs text-white/45 sm:flex-row sm:gap-6">
  
              <p>
                © 2026 Merkatá Bruktbutikk. Alle rettigheter reservert.
              </p>
  
              <span className="hidden text-white/20 sm:inline">
                •
              </span>
  
              <p>
                Designed by Josef Burkan & Kenny Vo
              </p>
  
            </div>
  
          </div>
  
        </div>
  
      </footer>
    );
  }
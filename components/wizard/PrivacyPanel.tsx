"use client";

export function PrivacyPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/20" onClick={onClose}>
      <aside
        className="h-full w-full max-w-md overflow-y-auto bg-card px-6 py-8 shadow-[-16px_0_40px_rgb(31_28_22/0.08)]"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-[13px] font-medium text-stone">Integritet</p>
        <h2 className="font-serif mt-2 text-[28px] font-semibold leading-9 text-ink">
          Vad händer med uppgifterna?
        </h2>

        <div className="mt-6 space-y-5 text-[16px] leading-7 text-stone">
          <section>
            <h3 className="font-medium text-ink">Vad vi sparar</h3>
            <p>Utkastet ligger i er webbläsare. Ingen inloggning, ingen databas, ingen filuppladdning.</p>
          </section>
          <section>
            <h3 className="font-medium text-ink">Vad GPT får se</h3>
            <p>
              Bara de svar som behövs för att skriva texten. Inte födelsedatum. Texten skickas till
              vår leverantör, används inte för träning och raderas därifrån efter 30 dagar.
            </p>
          </section>
          <section>
            <h3 className="font-medium text-ink">Vad skolan får</h3>
            <p>
              Det ni exporterar och lämnar själva. Appen skickar inget till skolan eller Skolverket.
            </p>
          </section>
          <section>
            <h3 className="font-medium text-ink">Hur du raderar</h3>
            <p>Klicka på Radera utkast i toppen. Då försvinner allt från den här webbläsaren.</p>
          </section>
          <section>
            <h3 className="font-medium text-ink">Kontakt</h3>
            <p>
              Dataskydd:{" "}
              <a className="text-klint underline" href="mailto:info@svenskaskolanmallorca.com">
                info@svenskaskolanmallorca.com
              </a>
            </p>
          </section>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 h-12 rounded-xl bg-pine px-5 text-[16px] font-medium text-white"
        >
          Stäng
        </button>
      </aside>
    </div>
  );
}

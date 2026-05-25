const valueProps = [
  {
    title: '精選台灣品牌',
    subtitle: 'Curated brands made with care in Taiwan',
  },
  {
    title: '支持本土品牌',
    subtitle: 'Support local makers and independent brands',
  },
  {
    title: '多元品類探索',
    subtitle: 'Explore categories from food to fashion',
  },
]

export function ValueProps() {
  return (
    <section className="bg-[#FAF7F4] py-16">
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {valueProps.map(({ title, subtitle }) => (
            <div
              key={title}
              className="rounded-xl border border-[#E5E4E1] bg-white p-6"
            >
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#1A1918]">
                {title}
              </h3>
              <p className="mt-2 text-sm text-[#7C7570]">{subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

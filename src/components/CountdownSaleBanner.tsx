type CountdownSaleBannerProps = {
  promoText: string;
};

export function CountdownSaleBanner({ promoText }: CountdownSaleBannerProps) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 3);
  const deadline = endDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-amber-950">{promoText}</p>
        <p className="text-xs tracking-[0.2em] text-amber-900/80 uppercase">
          Ends {deadline}
        </p>
      </div>
    </section>
  );
}

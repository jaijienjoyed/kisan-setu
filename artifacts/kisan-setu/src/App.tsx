import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowRight, BadgeCheck, BarChart3, CalendarDays, ChevronLeft, CircleCheck,
  CircleDashed, Clock3, IndianRupee, Leaf, MapPin, Menu, Package, Plus, Search,
  ShieldCheck, Sparkles, Truck, Users, X,
} from 'lucide-react';
import {
  getGetListingQueryKey, getListListingsQueryKey, useCreateListing, useCreateTransportRequest,
  useGetDashboardSummary, useGetListing, useGetPriceSnapshot, useListBuyers, useListListings,
} from '@workspace/api-client-react';
import type { Buyer, Listing, ListingInput, PriceSnapshot } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import farmerField from '@/assets/farmer-field.jpg';

const queryClient = new QueryClient();

function Logo() {
  return <Link href="/" className="flex items-center gap-2.5" data-testid="link-logo">
    <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Leaf size={19} strokeWidth={2.5} /></span>
    <span className="leading-none"><strong className="font-editorial text-[17px]">KisanSetu</strong><small className="mt-1 block font-data text-[7px] tracking-[.19em] text-muted-foreground">DIRECT / FAIR / LOCAL</small></span>
  </Link>;
}

const navItems = [
  { href: '/marketplace', label: 'Marketplace', icon: Package },
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/buyers', label: 'Verified buyers', icon: Users },
  { href: '/transport', label: 'Transport', icon: Truck },
];

function Shell({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  return <div className="grain min-h-[100dvh] bg-background">
    <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 md:px-8">
      <Logo />
      <nav className="hidden items-center gap-7 md:flex">
        {navItems.slice(0, 3).map(({ href, label }) => <Link key={href} href={href} className={`text-sm font-medium transition-colors hover:text-primary ${location === href ? 'text-primary' : 'text-muted-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</Link>)}
      </nav>
      <div className="flex items-center gap-3">
        <span className="hidden rounded-full border border-border px-3 py-1.5 font-data text-[10px] text-muted-foreground sm:inline">अ / EN</span>
        <Link href="/sell" className="hidden rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_3px_0_hsl(10_65%_43%)] transition-transform hover:-translate-y-0.5 sm:inline-flex" data-testid="link-sell-top">Sell produce <ArrowRight size={15} className="ml-2" /></Link>
        <button className="rounded-md p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Open navigation" data-testid="button-open-navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </header>
    {open && <div className="border-y border-border bg-card px-5 py-3 md:hidden">
      {navItems.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 border-b border-border py-3 text-sm last:border-0" data-testid={`link-mobile-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} className="text-primary" />{label}</Link>)}
    </div>}
    {children}
    <footer className="mx-auto mt-20 flex max-w-[1240px] flex-col gap-4 border-t border-border px-5 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
      <span>© 2024 KisanSetu Direct. Built for better harvests.</span>
      <span className="font-data tracking-wider">FAIR PRICE · CLEAR PATH</span>
    </footer>
  </div>;
}

function PageIntro({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return <div className="mb-9 max-w-2xl animate-rise-in">
    <p className="mb-3 font-data text-[10px] font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p>
    <h1 className="font-editorial text-4xl leading-[1.03] tracking-[-.03em] text-foreground sm:text-5xl">{title}</h1>
    <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{detail}</p>
  </div>;
}

function StatusPill({ status, verified }: { status?: string; verified?: boolean }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-data text-[9px] uppercase tracking-wider ${verified ? 'bg-secondary/10 text-secondary' : status === 'sold' ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
    {verified ? <BadgeCheck size={12} /> : status === 'sold' ? <CircleCheck size={12} /> : <CircleDashed size={12} />} {verified ? 'Verified' : status ?? 'Available'}
  </span>;
}

function Field({ label, name, type = 'text', placeholder, required = true, value, onChange }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; value?: string | number; onChange?: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">{label}</span><input data-testid={`input-${name}`} name={name} type={type} required={required} placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} className="w-full rounded-md border border-input bg-background px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>;
}

function LoadingState({ label = 'Reading the market' }: { label?: string }) {
  return <div className="space-y-4" data-testid="state-loading">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/60" />)}<p className="text-center text-xs text-muted-foreground">{label}…</p></div>;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center" data-testid="state-error"><p className="font-editorial text-xl">The market is taking a breath.</p><p className="mt-2 text-sm text-muted-foreground">We couldn't load this just now.</p><button onClick={onRetry} className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" data-testid="button-retry">Try again</button></div>;
}

function Home() {
  const { data: summary } = useGetDashboardSummary();
  return <Shell><main>
    <section className="mx-auto grid max-w-[1240px] items-center gap-12 px-5 pb-14 pt-10 md:grid-cols-[.92fr_1.08fr] md:px-8 md:pb-24 md:pt-16">
      <div className="animate-rise-in">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 font-data text-[10px] tracking-[.15em] text-secondary"><ShieldCheck size={13} /> VERIFIED ACCOUNT NETWORK</span>
        <h1 className="max-w-[560px] font-editorial text-5xl leading-[.98] tracking-[-.045em] text-foreground sm:text-6xl md:text-[74px]">A fair route<br />from your field<br /><em className="text-primary not-italic">to a better market.</em></h1>
        <p className="mt-6 max-w-[480px] text-base leading-7 text-muted-foreground">KisanSetu Direct helps you find trusted buyers, fair prices, and a vehicle when your harvest is ready.</p>
        <div className="mt-7 flex flex-wrap items-center gap-4"><Link href="/marketplace" className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_4px_0_hsl(10_65%_43%)] transition-transform hover:-translate-y-0.5" data-testid="link-home-marketplace">See today's market <ArrowRight size={16} className="ml-2" /></Link><span className="flex items-center gap-2 text-xs text-muted-foreground"><CircleCheck size={15} className="text-secondary" /> Simple, verified, local</span></div>
        <div className="mt-10 flex gap-8 border-t border-border pt-5"><div><p className="font-data text-lg font-bold">{summary?.farmersConnected?.toLocaleString() ?? '12,480'}</p><p className="mt-1 text-[10px] text-muted-foreground">farmers connected</p></div><div className="border-l border-border pl-8"><p className="font-data text-lg font-bold">₹{summary?.fairTradeValue ? `${(summary.fairTradeValue / 100000).toFixed(1)}L` : '18.6L'}</p><p className="mt-1 text-[10px] text-muted-foreground">fair trade this month</p></div></div>
      </div>
      <div className="relative mx-auto w-full max-w-[560px] animate-rise-in [animation-delay:120ms]">
        <div className="relative aspect-[1.05/1] overflow-hidden rounded-[24px] border-[6px] border-card bg-[#b1a888] shadow-[0_25px_60px_rgba(43,50,57,.17)]">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `linear-gradient(165deg, rgba(49,66,67,.18), rgba(38,61,53,.24)), url(${farmerField})` }} />
          <div className="absolute bottom-0 left-[-10%] h-[48%] w-[125%] -rotate-6 bg-[repeating-linear-gradient(8deg,transparent_0_16px,rgba(202,183,115,.35)_17px_19px,transparent_20px_32px)] opacity-90" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#273b31]/70 to-transparent" />
          <div className="absolute bottom-[10%] right-[15%] flex h-[54%] w-[31%] items-end justify-center"><div className="relative h-full w-[70%] rounded-t-[48%] bg-[#e7d7b8] shadow-[-10px_0_0_#c5ae88]"><div className="absolute left-[-11%] top-[4%] h-[18%] w-[122%] rounded-[50%] bg-[#ded0ad] shadow-[inset_0_-8px_0_#b08d67]"/><div className="absolute left-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-foreground"/><div className="absolute right-[18%] top-[22%] h-1.5 w-1.5 rounded-full bg-foreground"/><div className="absolute left-[30%] top-[35%] h-8 w-[40%] rounded-b-full border-b-2 border-[#9b6a54]"/></div></div>
          <div className="absolute bottom-5 left-5 max-w-[260px] text-card"><p className="font-editorial text-2xl leading-tight">A better deal starts with a clear path.</p><p className="mt-2 text-[11px] text-card/70">From the field to the local market</p></div>
          <span className="absolute bottom-5 right-5 flex size-9 items-center justify-center rounded-full bg-accent text-accent-foreground"><ArrowRight size={17} /></span>
        </div>
        <div className="absolute -bottom-4 -left-3 flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 paper-shadow"><span className="flex size-7 items-center justify-center rounded-full bg-secondary/10 text-secondary"><IndianRupee size={14} /></span><span><strong className="font-data text-xs">+₹4.20 / kg</strong><small className="block text-[9px] text-muted-foreground">better than local mandi</small></span></div>
      </div>
    </section>
    <section className="mx-auto grid max-w-[1240px] gap-4 px-5 pb-14 md:grid-cols-3 md:px-8 md:pb-24">
      {([['01', 'See the fair price', 'Know what your crop is worth before you say yes.', BarChart3], ['02', 'Meet the right buyer', 'Verified people who are ready for your lot.', Users], ['03', 'Move it with confidence', 'A trusted vehicle when your harvest is ready.', Truck]] as [string, string, string, typeof BarChart3][]).map(([num, title, desc, Icon]) => <div key={num} className="lift rounded-xl border border-border bg-card p-6"><span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon size={17} /></span><p className="mt-7 font-data text-[10px] text-muted-foreground">{num}</p><h2 className="mt-1 font-editorial text-2xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p></div>)}
    </section>
    <section className="bg-secondary px-5 py-14 text-secondary-foreground md:px-8 md:py-20"><div className="mx-auto grid max-w-[1240px] gap-8 md:grid-cols-[1fr_1.3fr] md:items-end"><div><p className="font-data text-[10px] tracking-[.18em] opacity-70">THE KISANSETU PROMISE</p><h2 className="mt-4 font-editorial text-4xl leading-tight md:text-5xl">Your harvest.<br />Your say.</h2></div><p className="max-w-md text-sm leading-7 opacity-80">No hidden bids. No middleman guessing. Every listing shows the local mandi price beside the fair price — so the next decision is yours.</p></div></section>
  </main></Shell>;
}

function ListingCard({ listing }: { listing: Listing }) {
  const lift = listing.marketPrice ? Math.round(((listing.askingPrice - listing.marketPrice) / listing.marketPrice) * 100) : 0;
  return <Link href={`/marketplace/${listing.id}`} className="lift block rounded-xl border border-border bg-card p-5" data-testid={`card-listing-${listing.id}`}>
    <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-editorial text-2xl">{listing.crop}</h3>{listing.verified && <BadgeCheck size={15} className="text-secondary" />}</div><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={12} />{listing.location} · {listing.farmerName}</p></div><StatusPill status={listing.status} /></div>
    <div className="mt-7 grid grid-cols-3 gap-3 border-t border-border pt-4"><div><p className="font-data text-lg font-bold">₹{listing.askingPrice}</p><p className="text-[10px] text-muted-foreground">asking / {listing.unit}</p></div><div><p className="font-data text-lg">₹{listing.marketPrice}</p><p className="text-[10px] text-muted-foreground">local mandi</p></div><div><p className={`font-data text-lg ${lift >= 0 ? 'text-secondary' : 'text-primary'}`}>{lift >= 0 ? '+' : ''}{lift}%</p><p className="text-[10px] text-muted-foreground">price lift</p></div></div>
    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span className="flex items-center gap-1"><Package size={13} /> {listing.quantity} {listing.unit}</span><span className="flex items-center gap-1">View lot <ArrowRight size={13} /></span></div>
  </Link>;
}

function Marketplace() {
  const [crop, setCrop] = useState('');
  const [location, setLocation] = useState('');
  const listings = useListListings({ crop: crop || undefined, location: location || undefined, status: 'available' });
  const data = listings.data ?? [];
  return <Shell><main className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-16">
    <PageIntro eyebrow="Open market · updated today" title="Good crops deserve a clear price." detail="Browse available lots from connected farmers. Compare each asking price with the local mandi before you reach out." />
    <div className="mb-7 flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row"><label className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3"><Search size={16} className="text-muted-foreground" /><input value={crop} onChange={e => setCrop(e.target.value)} placeholder="Search crop" className="w-full bg-transparent py-2 text-sm outline-none" data-testid="input-search-crop" /></label><label className="flex flex-1 items-center gap-2 rounded-md bg-muted px-3"><MapPin size={16} className="text-muted-foreground" /><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Filter by district" className="w-full bg-transparent py-2 text-sm outline-none" data-testid="input-filter-location" /></label><button onClick={() => { setCrop(''); setLocation(''); }} className="rounded-md px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10" data-testid="button-clear-filters">Clear</button></div>
    {listings.isLoading ? <LoadingState /> : listings.isError ? <ErrorState onRetry={() => listings.refetch()} /> : data.length === 0 ? <div className="rounded-xl border border-dashed border-border p-14 text-center" data-testid="state-empty-listings"><Package className="mx-auto text-muted-foreground" /><h2 className="mt-4 font-editorial text-2xl">No matching lots yet</h2><p className="mt-2 text-sm text-muted-foreground">Try a wider search, or be the first farmer to list this crop.</p><Link href="/sell" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="link-empty-sell">List your harvest</Link></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.map(item => <ListingCard key={item.id} listing={item} />)}</div>}
  </main></Shell>;
}

function ListingDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const query = useGetListing(id, { query: { queryKey: getGetListingQueryKey(id), enabled: Number.isFinite(id) } });
  const listing = query.data;
  const [setLocation] = [useLocation()[1]];
  if (query.isLoading) return <Shell><main className="mx-auto max-w-3xl px-5 py-16"><LoadingState label="Opening lot details" /></main></Shell>;
  if (query.isError || !listing) return <Shell><main className="mx-auto max-w-3xl px-5 py-16"><ErrorState onRetry={() => query.refetch()} /></main></Shell>;
  return <Shell><main className="mx-auto max-w-3xl px-5 py-10 md:py-16"><Link href="/marketplace" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary" data-testid="link-back-marketplace"><ChevronLeft size={15} /> All lots</Link><div className="rounded-2xl border border-border bg-card p-6 md:p-10"><div className="flex flex-wrap items-start justify-between gap-4"><div><StatusPill verified={listing.verified} status={listing.status} /><h1 className="mt-4 font-editorial text-5xl">{listing.crop}</h1><p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={14} />{listing.location} · grown by {listing.farmerName}</p></div><div className="rounded-xl bg-primary/10 px-4 py-3 text-right"><p className="font-data text-2xl font-bold text-primary">₹{listing.askingPrice}</p><p className="text-[10px] text-muted-foreground">per {listing.unit}</p></div></div><div className="my-9 grid grid-cols-2 gap-3 border-y border-border py-5 md:grid-cols-4"><div><p className="text-[10px] uppercase text-muted-foreground">Quantity</p><p className="mt-1 font-data font-bold">{listing.quantity} {listing.unit}</p></div><div><p className="text-[10px] uppercase text-muted-foreground">Mandi today</p><p className="mt-1 font-data font-bold">₹{listing.marketPrice}</p></div><div><p className="text-[10px] uppercase text-muted-foreground">Harvested</p><p className="mt-1 font-data font-bold">{new Date(listing.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div><div><p className="text-[10px] uppercase text-muted-foreground">Route</p><p className="mt-1 font-data font-bold text-secondary">Local</p></div></div><p className="max-w-xl text-sm leading-7 text-muted-foreground">A verified lot with a transparent asking price. Arrange a trusted vehicle when you are ready to move it.</p><div className="mt-8 flex flex-wrap gap-3"><Link href={`/transport?listingId=${listing.id}`} className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-request-transport">Arrange transport <Truck size={16} className="ml-2" /></Link><button onClick={() => setLocation('/buyers')} className="rounded-md border border-border px-5 py-3 text-sm font-bold hover:bg-muted" data-testid="button-find-buyer">Find a buyer</button></div></div></main></Shell>;
}

function Dashboard() {
  const query = useGetDashboardSummary();
  const snap = useGetPriceSnapshot();
  const summary = query.data;
  const stats = summary ? [['FARMERS CONNECTED', summary.farmersConnected.toLocaleString(), 'this network'], ['FAIR TRADE VALUE', `₹${(summary.fairTradeValue / 100000).toFixed(1)}L`, 'this month'], ['AVAILABLE LOTS', summary.availableLots, 'ready to move'], ['VERIFIED BUYERS', summary.verifiedBuyers, 'active today'], ['AVERAGE PRICE LIFT', `+${summary.averagePriceLift}%`, 'above mandi']] : [];
  return <Shell><main className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-16"><PageIntro eyebrow="Your market view · 24 June 2024" title="A little more clarity, every day." detail="See what is moving, what is fair, and where your next good conversation might start." />{query.isLoading ? <LoadingState label="Preparing your market view" /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : <><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{stats.map(([label, value, note], i) => <div key={label as string} className={`rounded-xl border p-4 ${i === 4 ? 'border-secondary/30 bg-secondary/10' : 'border-border bg-card'}`} data-testid={`stat-dashboard-${i}`}><p className="font-data text-[9px] tracking-wider text-muted-foreground">{label as string}</p><p className="mt-4 font-editorial text-3xl">{value as string}</p><p className="mt-1 text-[10px] text-muted-foreground">{note as string}</p></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_.8fr]"><div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><div><p className="font-data text-[10px] tracking-wider text-primary">PRICE PULSE</p><h2 className="mt-1 font-editorial text-2xl">Know where the day is going.</h2></div><BarChart3 size={22} className="text-secondary" /></div>{snap.isLoading ? <div className="mt-6 h-40 animate-pulse rounded bg-muted" /> : snap.isError ? <p className="mt-6 text-sm text-muted-foreground">Price pulse is unavailable right now.</p> : <div className="mt-6 space-y-4">{(snap.data ?? []).slice(0, 4).map((item: PriceSnapshot) => <div key={item.crop} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-border pt-3" data-testid={`row-price-${item.crop}`}><div><p className="text-sm font-semibold">{item.crop}</p><p className="text-[10px] text-muted-foreground">{item.localMandi} local mandi · per {item.unit}</p></div><p className="font-data text-sm">₹{item.bestBuyerPrice}</p><span className={`font-data text-xs ${item.change >= 0 ? 'text-secondary' : 'text-primary'}`}>{item.change >= 0 ? '+' : ''}{item.change}%</span></div>)}</div>}</div><div className="rounded-xl bg-secondary p-6 text-secondary-foreground"><Sparkles size={22} /><h2 className="mt-5 font-editorial text-3xl">Your next move</h2><p className="mt-3 text-sm leading-6 opacity-80">Have something ready in the field? Put it in front of the right buyers today.</p><Link href="/sell" className="mt-8 inline-flex items-center rounded-md bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground" data-testid="link-dashboard-sell">Create a listing <Plus size={15} className="ml-2" /></Link></div></div></>}</main></Shell>;
}

function Sell() {
  const create = useCreateListing();
  const qc = useQueryClient();
  const [success, setSuccess] = useState<Listing | null>(null);
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setError(''); const f = new FormData(e.currentTarget); const payload: ListingInput = { farmerName: String(f.get('farmerName')), crop: String(f.get('crop')), quantity: Number(f.get('quantity')), unit: String(f.get('unit')), askingPrice: Number(f.get('askingPrice')), marketPrice: Number(f.get('marketPrice')), location: String(f.get('location')), harvestDate: String(f.get('harvestDate')) }; create.mutate({ data: payload }, { onSuccess: listing => { setSuccess(listing); qc.invalidateQueries({ queryKey: getListListingsQueryKey() }); }, onError: () => setError('We could not save that lot. Please check the details and try again.') }); };
  if (success) return <Shell><main className="mx-auto max-w-2xl px-5 py-20 text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/15 text-secondary"><CircleCheck size={32} /></span><p className="mt-6 font-data text-[10px] tracking-[.18em] text-secondary">LISTING LIVE</p><h1 className="mt-3 font-editorial text-5xl">Your harvest has a clear path.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Buyers can now see your {success.crop} lot at ₹{success.askingPrice} per {success.unit}.</p><div className="mt-8 flex justify-center gap-3"><Link href={`/marketplace/${success.id}`} className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-view-created-listing">View your listing</Link><Link href="/sell" className="rounded-md border border-border px-5 py-3 text-sm font-bold" data-testid="link-create-another">Add another</Link></div></main></Shell>;
  return <Shell><main className="mx-auto max-w-[1000px] px-5 py-10 md:px-8 md:py-16"><PageIntro eyebrow="Put your harvest on the map" title="Tell the market what you have." detail="A clear listing helps the right buyer find you — and helps you ask for a fair price." /><form onSubmit={submit} className="grid gap-5 rounded-2xl border border-border bg-card p-5 md:grid-cols-2 md:p-8"><div className="md:col-span-2"><h2 className="font-editorial text-2xl">About the harvest</h2></div><Field label="Your name" name="farmerName" placeholder="e.g. Suresh Patil" /><Field label="Crop" name="crop" placeholder="e.g. Onion" /><Field label="Quantity" name="quantity" type="number" placeholder="e.g. 500" /><label className="block"><span className="mb-2 block text-xs font-semibold">Unit</span><select name="unit" defaultValue="kg" className="w-full rounded-md border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" data-testid="select-unit"><option value="kg">Kilograms</option><option value="quintal">Quintal</option><option value="crate">Crates</option><option value="tonne">Tonnes</option></select></label><Field label="Your asking price (₹ / unit)" name="askingPrice" type="number" placeholder="e.g. 28" /><Field label="Local mandi price (₹ / unit)" name="marketPrice" type="number" placeholder="e.g. 24" /><Field label="Pickup location" name="location" placeholder="Village, district" /><Field label="Harvest date" name="harvestDate" type="date" /><div className="md:col-span-2 mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5"><p className="max-w-sm text-xs leading-5 text-muted-foreground">Your listing is reviewed for basic details before it appears to buyers.</p><button type="submit" disabled={create.isPending} className="inline-flex items-center rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-submit-listing">{create.isPending ? 'Publishing…' : 'Publish listing'} <ArrowRight size={16} className="ml-2" /></button></div>{error && <p className="md:col-span-2 text-sm text-destructive" data-testid="text-form-error">{error}</p>}</form></main></Shell>;
}

function BuyerCard({ buyer }: { buyer: Buyer }) {
  return <div className="lift rounded-xl border border-border bg-card p-5" data-testid={`card-buyer-${buyer.id}`}><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-11 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">{buyer.name.split(' ').map(v => v[0]).join('').slice(0, 2)}</span><div><h2 className="font-editorial text-xl">{buyer.name}</h2><p className="text-xs text-muted-foreground">{buyer.category}</p></div></div>{buyer.verified && <BadgeCheck className="text-secondary" size={18} />}</div><div className="mt-5 space-y-2 text-xs text-muted-foreground"><p className="flex items-center gap-2"><MapPin size={14} />{buyer.location}</p><p className="flex items-center gap-2"><Clock3 size={14} />Usually replies in {buyer.responseTime}</p><p className="flex items-center gap-2"><Leaf size={14} />Buys {buyer.crops.join(', ')}</p></div><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="font-data text-xs text-accent-foreground">★ {buyer.rating?.toFixed(1) ?? 'New'} <span className="text-muted-foreground">rating</span></span><span className="rounded-full bg-secondary/10 px-2.5 py-1 font-data text-[9px] text-secondary">VERIFIED BUYER</span></div></div>;
}

function Buyers() {
  const query = useListBuyers();
  const [search, setSearch] = useState('');
  const data = useMemo(() => (query.data ?? []).filter(b => `${b.name} ${b.location} ${b.crops.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [query.data, search]);
  return <Shell><main className="mx-auto max-w-[1240px] px-5 py-10 md:px-8 md:py-16"><PageIntro eyebrow="People worth knowing" title="Buyers who show their work." detail="Every buyer here has been verified and has a clear interest in local produce. No cold calls, no guessing." /><div className="mb-7 flex max-w-md items-center gap-2 rounded-md border border-input bg-card px-3"><Search size={16} className="text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buyers or crops" className="w-full bg-transparent py-3 text-sm outline-none" data-testid="input-search-buyers" /></div>{query.isLoading ? <LoadingState label="Finding trusted buyers" /> : query.isError ? <ErrorState onRetry={() => query.refetch()} /> : data.length === 0 ? <div className="rounded-xl border border-dashed border-border p-14 text-center" data-testid="state-empty-buyers"><Users className="mx-auto text-muted-foreground" /><h2 className="mt-4 font-editorial text-2xl">No buyers match that search</h2><p className="mt-2 text-sm text-muted-foreground">Try a crop, city, or buyer name.</p></div> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{data.map(b => <BuyerCard key={b.id} buyer={b} />)}</div>}</main></Shell>;
}

function Transport() {
  const params = new URLSearchParams(window.location.search);
  const presetId = Number(params.get('listingId'));
  const listings = useListListings({ status: 'available' });
  const create = useCreateTransportRequest();
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const f = new FormData(e.currentTarget); setError(''); create.mutate({ data: { listingId: Number(f.get('listingId')), pickupLocation: String(f.get('pickupLocation')), pickupDate: String(f.get('pickupDate')), vehicleType: String(f.get('vehicleType')) } }, { onSuccess: () => setDone(true), onError: () => setError('We could not send the request. Please try again.') }); };
  if (done) return <Shell><main className="mx-auto max-w-2xl px-5 py-20 text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary/15 text-secondary"><Truck size={29} /></span><h1 className="mt-6 font-editorial text-5xl">The wheels are in motion.</h1><p className="mt-4 text-sm leading-6 text-muted-foreground">Your transport request is with our local partners. We will match a vehicle and confirm the estimated cost.</p><Link href="/marketplace" className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-transport-marketplace">Back to marketplace</Link></main></Shell>;
  return <Shell><main className="mx-auto max-w-3xl px-5 py-10 md:py-16"><PageIntro eyebrow="A clear path to market" title="Move your harvest with confidence." detail="Tell us when and where. We'll find a trusted local vehicle for the lot you have ready." /><form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-card p-5 md:p-8"><label className="block"><span className="mb-2 block text-xs font-semibold">Select listing</span><select name="listingId" defaultValue={presetId || ''} required className="w-full rounded-md border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" data-testid="select-transport-listing"><option value="" disabled>Choose a harvest lot</option>{(listings.data ?? []).map(l => <option key={l.id} value={l.id}>{l.crop} · {l.quantity} {l.unit} · {l.location}</option>)}</select></label><Field label="Pickup location" name="pickupLocation" placeholder="Village, district, state" /><Field label="Pickup date" name="pickupDate" type="date" /><label className="block"><span className="mb-2 block text-xs font-semibold">Vehicle type</span><select name="vehicleType" defaultValue="mini-truck" className="w-full rounded-md border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary" data-testid="select-vehicle-type"><option value="mini-truck">Mini truck · up to 1 tonne</option><option value="pickup">Pickup · up to 2 tonnes</option><option value="lorry">Lorry · 5 tonnes</option></select></label><div className="flex items-center justify-between border-t border-border pt-5"><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck size={15} className="text-secondary" />No commitment until matched</div><button type="submit" disabled={create.isPending || listings.isLoading} className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60" data-testid="button-submit-transport">{create.isPending ? 'Sending…' : 'Request vehicle'} <ArrowRight size={15} className="ml-2 inline" /></button></div>{error && <p className="text-sm text-destructive" data-testid="text-transport-error">{error}</p>}</form></main></Shell>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/marketplace" component={Marketplace} /><Route path="/marketplace/:id" component={ListingDetail} /><Route path="/dashboard" component={Dashboard} /><Route path="/sell" component={Sell} /><Route path="/buyers" component={Buyers} /><Route path="/transport" component={Transport} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

export default function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Router /><Toaster /></TooltipProvider></QueryClientProvider>;
}
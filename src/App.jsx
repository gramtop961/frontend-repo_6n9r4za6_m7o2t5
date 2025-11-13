import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Section({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

function TextInput({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  )
}

function NumberInput(props) {
  return <TextInput {...props} type="number" />
}

function Pill({ children, color = 'blue' }) {
  const map = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-50 text-orange-700',
  }
  return <span className={`px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{children}</span>
}

function useApi() {
  const base = API_BASE
  const get = async (path) => (await fetch(`${base}${path}`)).json()
  const post = async (path, body) => (
    await fetch(`${base}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  ).json()
  return { get, post, base }
}

function Customers() {
  const api = useApi()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.get('/customers')
      setList(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async () => {
    if (!name) return
    await api.post('/customers', { name, email, phone })
    setName(''); setEmail(''); setPhone('')
    load()
  }

  return (
    <Section
      title="Customers"
      action={<button onClick={load} className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">Refresh</button>}
    >
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <TextInput label="Name" value={name} onChange={setName} placeholder="PT Contoh Jaya" />
          <TextInput label="Email" value={email} onChange={setEmail} placeholder="sales@contoh.co.id" />
          <TextInput label="Phone" value={phone} onChange={setPhone} placeholder="0812xxxx" />
          <button onClick={add} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm font-medium">Add Customer</button>
          <p className="text-xs text-gray-500">API: {api.base}/customers</p>
        </div>
        <div className="md:col-span-2">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c._id} className="border-t">
                      <td className="py-2 pr-4 font-medium text-gray-800">{c.name}</td>
                      <td className="py-2 pr-4">{c.email || '-'}</td>
                      <td className="py-2 pr-4">{c.phone || '-'}</td>
                      <td className="py-2 pr-4 text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

function Products() {
  const api = useApi()
  const [list, setList] = useState([])
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('0')

  const load = async () => {
    try { setList(await api.get('/products')) } catch (e) { console.error(e) }
  }
  useEffect(() => { load() }, [])

  const add = async () => {
    if (!sku || !name) return
    await api.post('/products', { sku, name, price: parseFloat(price || '0') })
    setSku(''); setName(''); setPrice('0')
    load()
  }

  return (
    <Section title="Products" action={<button onClick={load} className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">Refresh</button>}>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <TextInput label="SKU" value={sku} onChange={setSku} placeholder="SKU-001" />
          <TextInput label="Name" value={name} onChange={setName} placeholder="Produk A" />
          <NumberInput label="Price (IDR)" value={price} onChange={setPrice} />
          <button onClick={add} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 text-sm font-medium">Add Product</button>
          <p className="text-xs text-gray-500">API: {api.base}/products</p>
        </div>
        <div className="md:col-span-2">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">SKU</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Price</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{p.sku}</td>
                    <td className="py-2 pr-4">{p.name}</td>
                    <td className="py-2 pr-4">{typeof p.price === 'number' ? p.price.toLocaleString('id-ID') : p.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}

function Invoices() {
  const api = useApi()
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [list, setList] = useState([])

  const load = async () => {
    try {
      const [p, c, inv] = await Promise.all([
        api.get('/products'), api.get('/customers'), api.get('/invoices')
      ])
      setProducts(p); setCustomers(c); setList(inv)
    } catch (e) { console.error(e) }
  }
  useEffect(() => { load() }, [])

  const addItem = () => setItems((prev) => [...prev, { product_id: '', name: '', quantity: 1, price: 0 }])
  const updateItem = (idx, patch) => setItems((prev) => prev.map((it, i) => i === idx ? { ...it, ...patch } : it))
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    const payload = { customer_id: customerId, items: items.map((i) => ({ ...i, quantity: Number(i.quantity), price: Number(i.price) })) }
    await api.post('/invoices', payload)
    setItems([]); setCustomerId('')
    load()
  }

  const productMap = useMemo(() => Object.fromEntries(products.map(p => [p._id, p])), [products])

  return (
    <Section title="Invoices" action={<button onClick={load} className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">Refresh</button>}>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1 space-y-3">
          <label className="block">
            <span className="text-sm text-gray-600">Customer</span>
            <select value={customerId} onChange={(e)=>setCustomerId(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select customer</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Items</span>
              <button onClick={addItem} className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700">Add</button>
            </div>
            {items.length === 0 && <div className="text-xs text-gray-500">No items yet.</div>}
            {items.map((it, idx) => (
              <div key={idx} className="p-2 border rounded-md space-y-2">
                <label className="block">
                  <span className="text-xs text-gray-600">Product</span>
                  <select value={it.product_id} onChange={(e)=>{
                    const id = e.target.value
                    const p = productMap[id]
                    updateItem(idx, { product_id: id, name: p?.name || '', price: p?.price || 0 })
                  }} className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm">
                    <option value="">Custom</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                </label>
                <TextInput label="Name" value={it.name} onChange={(v)=>updateItem(idx,{ name: v })} placeholder="Item name" />
                <div className="grid grid-cols-2 gap-2">
                  <NumberInput label="Qty" value={it.quantity} onChange={(v)=>updateItem(idx,{ quantity: v })} />
                  <NumberInput label="Price" value={it.price} onChange={(v)=>updateItem(idx,{ price: v })} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">{(Number(it.quantity||0)*Number(it.price||0)).toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <button onClick={()=>removeItem(idx)} className="text-xs text-red-600 hover:underline">Remove</button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={submit} disabled={!customerId || items.length===0} className="w-full mt-2 bg-green-600 disabled:opacity-50 hover:bg-green-700 text-white rounded-md py-2 text-sm font-medium">Create Invoice</button>
          <p className="text-xs text-gray-500">API: {api.base}/invoices</p>
        </div>
        <div className="md:col-span-2">
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Items</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {list.map((inv) => (
                  <tr key={inv._id} className="border-t">
                    <td className="py-2 pr-4">{inv.customer_id}</td>
                    <td className="py-2 pr-4">{inv.items?.length || 0}</td>
                    <td className="py-2 pr-4 font-medium">{inv.total?.toLocaleString('id-ID')}</td>
                    <td className="py-2 pr-4"><Pill color={inv.status==='paid'?'green':'blue'}>{inv.status}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Section>
  )
}

function TopBar() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-600" />
        <div>
          <div className="text-sm text-gray-500">Mini ERP</div>
          <div className="font-semibold text-gray-800">Linqkeun</div>
        </div>
      </div>
      <div className="text-sm text-gray-500">AI-Augmented • Indonesia Ready</div>
    </div>
  )
}

function App() {
  const [tab, setTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <TopBar />
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'customers', label: 'Sales & CRM' },
            { id: 'products', label: 'Inventory' },
            { id: 'invoices', label: 'Finance (Invoices)' },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-full text-sm border ${tab===t.id? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl p-5 shadow">
              <div className="text-sm opacity-90">Sales (This Month)</div>
              <div className="text-3xl font-bold mt-1">IDR 0</div>
              <div className="text-xs mt-2 opacity-90">Forecast: Coming Soon</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl p-5 shadow">
              <div className="text-sm opacity-90">Top Product</div>
              <div className="text-3xl font-bold mt-1">-</div>
              <div className="text-xs mt-2 opacity-90">AI Insights: Coming Soon</div>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-5 shadow">
              <div className="text-sm opacity-90">Stock Alerts</div>
              <div className="text-3xl font-bold mt-1">0</div>
              <div className="text-xs mt-2 opacity-90">Restock Prediction: Coming Soon</div>
            </div>
          </div>
        )}

        {tab === 'customers' && <Customers />}
        {tab === 'products' && <Products />}
        {tab === 'invoices' && <Invoices />}

        <div className="py-8 text-center text-xs text-gray-500">Mini ERP • Modular • API-first • PPN Ready</div>
      </div>
    </div>
  )
}

export default App

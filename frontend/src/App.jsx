import React, { useState, useEffect, useRef } from 'react'
import html2pdf from 'html2pdf.js'

// Local high-fidelity mock data fallbacks in case backend is offline
const MOCK_CUSTOMERS = [
  { id: 1, name: 'Alingal Traders', custom_id: 'FT-9902', location: 'Manjeri', phone: '+91 94460 12345', email: 'alingal.traders@email.com', total_outstanding_balance: 14250.00, cycle: 'Weekly Cycle', status: 'overdue', last_activity: 'Oct 24, 2023', last_activity_desc: 'Delivery: 10x 10kg Block Ice', icon: 'store' },
  { id: 2, name: 'Tirur Cold Storage', custom_id: 'FT-8421', location: 'Tirur', phone: '+91 94460 88200', email: 'tirur.cold@email.com', total_outstanding_balance: 4800.00, cycle: 'Immediate', status: 'overdue', last_activity: 'Oct 23, 2023', last_activity_desc: 'Delivery: 355x 50kg Bags', icon: 'ac_unit' },
  { id: 3, name: 'Polar Ice Hub', custom_id: 'FT-3329', location: 'Kottakkal', phone: '+91 98950 11220', email: 'polar.ice@email.com', total_outstanding_balance: 0.00, cycle: 'Net 30', status: 'cleared', last_activity: 'Oct 12, 2023', last_activity_desc: 'Cleared outstanding due', icon: 'factory' },
  { id: 4, name: 'Frosty Delights', custom_id: 'FT-2110', location: 'Malappuram', phone: '+91 97440 33445', email: 'frosty.delights@email.com', total_outstanding_balance: 2100.00, cycle: 'Net 30', status: 'active', last_activity: 'Oct 18, 2023', last_activity_desc: 'Delivery: 170x 30kg Bags', icon: 'icecream' },
  { id: 5, name: 'City Central Mart', custom_id: 'FT-2201', location: 'Perinthalmanna', phone: '+91 90200 44556', email: 'city.central@email.com', total_outstanding_balance: 1250.00, cycle: 'Weekly Cycle', status: 'active', last_activity: 'Oct 10, 2023', last_activity_desc: 'Delivery: 50x 25kg Bags', icon: 'store' },
  { id: 6, name: 'Blue Ocean Seafood', custom_id: 'FT-3341', location: 'Ponnani', phone: '+91 99460 77112', email: 'blue.ocean@email.com', total_outstanding_balance: 0.00, cycle: 'Net 15', status: 'cleared', last_activity: 'Oct 24, 2023', last_activity_desc: 'Payment received', icon: 'store' },
  { id: 7, name: 'Crystal Cold Storage', custom_id: 'FT-4491', location: 'Tirur', phone: '+91 98455 66778', email: 'crystal.cold@email.com', total_outstanding_balance: 12800.00, cycle: 'Immediate', status: 'active', last_activity: 'Oct 23, 2023', last_activity_desc: 'Delivery: 320x 40kg Bags', icon: 'ac_unit' },
  { id: 8, name: 'Hotel Marina', custom_id: 'FT-5501', location: 'Kondotty', phone: '+91 94471 22334', email: 'hotel.marina@email.com', total_outstanding_balance: 0.00, cycle: 'Net 7', status: 'cleared', last_activity: 'Oct 20, 2023', last_activity_desc: 'Payment received', icon: 'store' },
  { id: 9, name: 'Deep Sea Logistics', custom_id: 'FT-6612', location: 'Nilambur', phone: '+91 97455 88990', email: 'deepsea.log@email.com', total_outstanding_balance: 5600.00, cycle: 'Net 30', status: 'overdue', last_activity: 'Oct 22, 2023', last_activity_desc: 'Delivery: 140x 40kg Blocks', icon: 'factory' }
]

const MOCK_SALES = [
  { id: 101, date: '2026-07-10', customer_name: 'Blue Ocean Seafood', customer_custom_id: 'FT-3341', quantity: 250, unit_type: 'Kg', unit_price: 17.00, total_amount: 4250.00, payment_status: 'Paid' },
  { id: 102, date: '2026-07-09', customer_name: 'Crystal Cold Storage', customer_custom_id: 'FT-4491', quantity: 320, unit_type: 'Bags', unit_price: 40.00, total_amount: 12800.00, payment_status: 'Pending' },
  { id: 103, date: '2026-07-09', customer_name: 'Hotel Marina', customer_custom_id: 'FT-5501', quantity: 70, unit_type: 'Bags', unit_price: 30.00, total_amount: 2100.00, payment_status: 'Paid' },
  { id: 104, date: '2026-07-08', customer_name: 'Deep Sea Logistics', customer_custom_id: 'FT-6612', quantity: 140, unit_type: 'Kg', unit_price: 40.00, total_amount: 5600.00, payment_status: 'Overdue' },
  { id: 105, date: '2026-07-06', customer_name: 'Alingal Traders', customer_custom_id: 'FT-8821', quantity: 100, unit_type: 'Bags', unit_price: 25.00, total_amount: 2500.00, payment_status: 'Overdue' },
  { id: 106, date: '2026-07-05', customer_name: 'Tirur Cold Storage', customer_custom_id: 'FT-9012', quantity: 355, unit_type: 'Kg', unit_price: 40.00, total_amount: 14200.00, payment_status: 'Pending' },
  { id: 107, date: '2026-07-04', customer_name: 'Malabar Ice Hub', customer_custom_id: 'FT-7729', quantity: 170, unit_type: 'Bags', unit_price: 30.00, total_amount: 5100.00, payment_status: 'Pending' },
  { id: 108, date: '2026-07-03', customer_name: 'City Central Mart', customer_custom_id: 'FT-2201', quantity: 50, unit_type: 'Bags', unit_price: 25.00, total_amount: 1250.00, payment_status: 'Pending' }
]

const MOCK_EXPENSES = [
  { id: 201, date: '2026-07-10', amount: 1240.00, category: 'Fuel', description: 'Diesel generator replenishment' },
  { id: 202, date: '2026-07-08', amount: 850.50, category: 'Electricity', description: 'Grid energy weekly invoice' },
  { id: 203, date: '2026-07-05', amount: 4120.00, category: 'Maintenance', description: 'Compressor belt replacements' },
  { id: 204, date: '2026-07-02', amount: 2300.00, category: 'Labor', description: 'Weekly shift wage operations' },
  { id: 205, date: '2026-06-29', amount: 1115.00, category: 'Other', description: 'Office water and sanitation supply' }
]

const MOCK_METRICS = {
  total_revenue_current_month: 124500.00,
  total_revenue_previous_month: 111160.00,
  revenue_growth_percentage: 12.0,
  total_expenses_current_month: 42850.24,
  total_expenses_previous_month: 41120.00,
  expenses_growth_percentage: 4.2,
  budgeted_expenses: 45000.00,
  total_outstanding_receivables: 41450.00,
  active_due_customers_count: 6
}

const MOCK_TREND = [
  { label: 'Day 01', amount: 3200 },
  { label: 'Day 05', amount: 4800 },
  { label: 'Day 10', amount: 3900 },
  { label: 'Day 15', amount: 6200 },
  { label: 'Day 20', amount: 5500 },
  { label: 'Day 25', amount: 8400 },
  { label: 'Today', amount: 7100 }
]

const MOCK_CUSTOMER_HISTORY = {
  1: [ // Alingal Traders
    { date: '2023-10-24', type: 'Delivery', title: 'Block Ice Delivery', amount: -1250.00, details: '10x 10kg Blocks • INV #20394', status: 'Delivered' },
    { date: '2023-10-20', type: 'Payment', title: 'Account Payment', amount: 5000.00, details: 'Check Payment • REF #5521', status: 'Processed' },
    { date: '2023-10-15', type: 'Delivery', title: 'Tube Ice Delivery', amount: -850.00, details: '25x 2kg Packets • INV #20355', status: 'Delivered' },
    { date: '2023-10-10', type: 'Delivery', title: 'Block Ice Delivery', amount: -1250.00, details: '10x 10kg Blocks • INV #20312', status: 'Delivered' }
  ]
}

// Leaflet CDN Dynamic Loader to avoid Vite compile-time errors with map assets
let leafletLoaded = false
let leafletLoadingPromise = null

const loadLeaflet = () => {
  if (leafletLoaded) return Promise.resolve(window.L)
  if (leafletLoadingPromise) return leafletLoadingPromise

  leafletLoadingPromise = new Promise((resolve) => {
    // Add CSS
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    // Add JS
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      leafletLoaded = true
      resolve(window.L)
    }
    document.head.appendChild(script)
  })

  return leafletLoadingPromise
}

// Interactive Map Picker Component centered on Malappuram District, Kerala
const MapSelector = ({ selectedLocation, onSelectLocation }) => {
  const mapRef = useRef(null)
  const leafletMapInstance = useRef(null)

  const TOWNS = [
    { name: 'Malappuram', coords: [11.0720, 76.0740] },
    { name: 'Manjeri', coords: [11.1210, 76.1206] },
    { name: 'Tirur', coords: [10.9027, 75.9236] },
    { name: 'Kottakkal', coords: [11.0039, 76.0028] },
    { name: 'Perinthalmanna', coords: [10.9754, 76.2238] },
    { name: 'Ponnani', coords: [10.7719, 75.9251] },
    { name: 'Nilambur', coords: [11.2759, 76.2570] },
    { name: 'Kondotty', coords: [11.1492, 75.9602] }
  ]

  useEffect(() => {
    let active = true
    loadLeaflet().then((L) => {
      if (!active || !mapRef.current) return

      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove()
      }

      // Initialize map centered on Malappuram district area
      const map = L.map(mapRef.current).setView([11.03, 76.08], 10)
      leafletMapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map)

      const activeIcon = L.divIcon({
        className: 'custom-active-marker',
        html: `<div style="background-color: var(--primary); width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      const inactiveIcon = L.divIcon({
        className: 'custom-inactive-marker',
        html: `<div style="background-color: var(--outline); width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      })

      TOWNS.forEach((town) => {
        const marker = L.marker(town.coords, {
          icon: selectedLocation === town.name ? activeIcon : inactiveIcon
        }).addTo(map)

        marker.bindTooltip(`<b>${town.name}</b>`, {
          permanent: true,
          direction: 'top',
          offset: [0, -5],
          className: 'town-tooltip'
        })

        marker.on('click', () => {
          onSelectLocation(town.name)
        })
      })
    })

    return () => {
      active = false
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove()
        leafletMapInstance.current = null
      }
    }
  }, [selectedLocation])

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden', 
          border: '1px solid var(--outline-variant)', marginTop: '8px', zIndex: 1 
        }} 
      />
    </div>
  )
}

// Static Map replacement for Details View showing specific customer store hub coordinates
const DetailsMap = ({ locationName }) => {
  const mapRef = useRef(null)
  const leafletMapInstance = useRef(null)

  const TOWNS = {
    'Malappuram': [11.0720, 76.0740],
    'Manjeri': [11.1210, 76.1206],
    'Tirur': [10.9027, 75.9236],
    'Kottakkal': [11.0039, 76.0028],
    'Perinthalmanna': [10.9754, 76.2238],
    'Ponnani': [10.7719, 75.9251],
    'Nilambur': [11.2759, 76.2570],
    'Kondotty': [11.1492, 75.9602]
  }

  useEffect(() => {
    let active = true
    const coords = TOWNS[locationName] || [11.03, 76.08]

    loadLeaflet().then((L) => {
      if (!active || !mapRef.current) return

      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove()
      }

      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(coords, 12)
      
      leafletMapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

      const markerIcon = L.divIcon({
        className: 'custom-details-marker',
        html: `<div style="background-color: var(--primary); width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      L.marker(coords, { icon: markerIcon }).addTo(map)
    })

    return () => {
      active = false
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove()
        leafletMapInstance.current = null
      }
    }
  }, [locationName])

  return <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }} />
}

// Reusable custom themed select dropdown component
const CustomSelect = ({ value, onChange, options, style, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: compact ? '160px' : '100%', userSelect: 'none', ...style }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: compact ? '6px 12px' : '12px 16px', 
          borderRadius: compact ? '8px' : '12px', 
          border: '1px solid var(--outline-variant)',
          backgroundColor: 'var(--surface-container-lowest)', cursor: 'pointer', 
          fontSize: compact ? '12px' : '14px',
          boxShadow: 'var(--shadow-low)', transition: 'all 0.2s ease'
        }}
        className="hoverable"
      >
        <span style={{ fontWeight: '500', color: 'var(--on-surface)' }}>{value}</span>
        <span 
          className="material-symbols-outlined" 
          style={{ 
            fontSize: compact ? '16px' : '18px', color: 'var(--outline)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          expand_more
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
          background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--outline-variant)', borderRadius: compact ? '8px' : '12px', overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.08)', zIndex: 1000, display: 'flex', flexDirection: 'column'
        }}>
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setIsOpen(false)
              }}
              style={{
                padding: compact ? '6px 12px' : '10px 16px', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.03)',
                background: opt === value ? 'rgba(0,163,255,0.06)' : 'transparent', 
                textAlign: 'left', cursor: 'pointer', 
                fontSize: compact ? '12px' : '13px', 
                fontWeight: opt === value ? '600' : '500',
                color: opt === value ? 'var(--primary)' : 'var(--on-surface-variant)',
                transition: 'all 0.15s ease'
              }}
              className="hoverable"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Inline custom unit selector suffix (Bags/Kg)
const InlineUnitSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
          borderRadius: '8px', border: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)',
          cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', color: 'var(--on-surface-variant)', userSelect: 'none'
        }}
      >
        <span>{value}</span>
        <span className="material-symbols-outlined" style={{ fontSize: '14px', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }}>
          keyboard_arrow_down
        </span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '4px', minWidth: '80px',
          background: '#ffffff', border: '1px solid var(--outline-variant)', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 100
        }}>
          {['Bags', 'Kg'].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt)
                setIsOpen(false)
              }}
              style={{
                padding: '8px 12px', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.03)',
                background: opt === value ? 'rgba(0,163,255,0.06)' : 'transparent', 
                textAlign: 'left', cursor: 'pointer', fontSize: '11px', fontWeight: opt === value ? 'bold' : 'normal',
                color: opt === value ? 'var(--primary)' : 'var(--on-surface-variant)'
              }}
              className="hoverable"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://frozen-backend-wze5.onrender.com'

function App() {
  const [view, setView] = useState('splash') // splash | login | dashboard
  const [splashProgress, setSplashProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard | sales | expenses | customers
  
  // Drill-down customer details
  const [selectedCustomerId, setSelectedCustomerId] = useState(null)

  // Auth state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [userProfile, setUserProfile] = useState(null)

  // Quick Add Modal state
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddTab, setQuickAddTab] = useState('sale') // sale | expense
  
  // Quick Add Form fields
  const [saleCustomer, setSaleCustomer] = useState('')
  const [saleCustomerSearchQuery, setSaleCustomerSearchQuery] = useState('')
  const [saleQuantity, setSaleQuantity] = useState('')
  const [saleUnitType, setSaleUnitType] = useState('Bags')
  const [saleUnitPrice, setSaleUnitPrice] = useState('')
  const [salePaymentStatus, setSalePaymentStatus] = useState('Pending')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  
  const [expenseAmount, setExpenseAmount] = useState('')
  const [expenseCategory, setExpenseCategory] = useState('Fuel')
  const [expenseDescription, setExpenseDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0])
  const [expenseStatus, setExpenseStatus] = useState('Paid')
  const [expenseVendor, setExpenseVendor] = useState('')

  // Customer Add Modal state
  const [customerModalOpen, setCustomerModalOpen] = useState(false)
  const [custName, setCustName] = useState('')
  const [custID, setCustID] = useState('')
  const [custLocation, setCustLocation] = useState('Kozhikode')
  const [custPhone, setCustPhone] = useState('')
  const [custEmail, setCustEmail] = useState('')
  const [custCycle, setCustCycle] = useState('Weekly Cycle')
  const [custBalance, setCustBalance] = useState('')

  // Transaction Action Modal & Toast states
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [actionSale, setActionSale] = useState(null)
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  // Expense detail modal states
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)

  // Pending supplier payments states
  const [pendingModalOpen, setPendingModalOpen] = useState(false)
  const [pendingPayments, setPendingPayments] = useState([
    { id: 'SP-101', vendor: 'Calicut Fuel Center', category: 'Fuel', date: '2026-07-09', amount: 3200, status: 'Pending' },
    { id: 'SP-102', vendor: 'KSEB Electricity Board', category: 'Electricity', date: '2026-07-08', amount: 5010, status: 'Pending' }
  ])


  // Budget edit state
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [tempBudget, setTempBudget] = useState('')

  // Central Application Data States
  const [metrics, setMetrics] = useState(() => {
    const savedBudget = localStorage.getItem('budgeted_expenses')
    const budgetVal = savedBudget ? parseFloat(savedBudget) : 45000.00
    return {
      ...MOCK_METRICS,
      budgeted_expenses: budgetVal
    }
  })
  const [trend30Days, setTrend30Days] = useState(MOCK_TREND)
  const [trendRange, setTrendRange] = useState('Last 6 Months')

  const getChartData = () => {
    switch (trendRange) {
      case 'Last Month (Weekly)':
        return [
          { label: 'Week 1', amount: 24500 },
          { label: 'Week 2', amount: 28900 },
          { label: 'Week 3', amount: 31200 },
          { label: 'Week 4', amount: 39900 }
        ]
      case 'Last 6 Months':
        return [
          { label: 'Nov', amount: 82400 },
          { label: 'Dec', amount: 94500 },
          { label: 'Jan', amount: 88900 },
          { label: 'Feb', amount: 104200 },
          { label: 'Mar', amount: 98600 },
          { label: 'Apr', amount: 124500 }
        ]
      case 'Last Year (Monthly)':
        return [
          { label: 'Jul', amount: 78000 },
          { label: 'Aug', amount: 82400 },
          { label: 'Sep', amount: 85900 },
          { label: 'Oct', amount: 91200 },
          { label: 'Nov', amount: 89500 },
          { label: 'Dec', amount: 96800 },
          { label: 'Jan', amount: 92400 },
          { label: 'Feb', amount: 104200 },
          { label: 'Mar', amount: 99800 },
          { label: 'Apr', amount: 112500 },
          { label: 'May', amount: 118900 },
          { label: 'Jun', amount: 124500 }
        ]
      default:
        return trend30Days
    }
  }

  // Dynamic breakdown calculation for Expenses Categories
  const getCategoryBreakdown = () => {
    const categories = ['Fuel', 'Electricity', 'Maintenance', 'Labor', 'Other']
    const colors = {
      Fuel: 'var(--primary)',
      Electricity: 'var(--secondary)',
      Maintenance: 'var(--outline)',
      Labor: 'var(--on-secondary-fixed-variant)',
      Other: 'var(--outline-variant)'
    }
    const totals = categories.reduce((acc, cat) => {
      acc[cat] = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
      return acc
    }, {})
    const totalSum = Object.values(totals).reduce((sum, v) => sum + v, 0) || 1

    return categories.map(cat => ({
      name: cat,
      val: totals[cat],
      color: colors[cat] || 'var(--outline)',
      w: `${Math.round(totals[cat] / totalSum * 100)}%`
    })).filter(c => c.val > 0)
  }

  const [recentActivity, setRecentActivity] = useState(MOCK_SALES.slice(0, 5))
  const [sales, setSales] = useState(MOCK_SALES)
  const [expenses, setExpenses] = useState(MOCK_EXPENSES)
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)
  
  // Filtering & searching states
  const [searchQuery, setSearchQuery] = useState('')
  const [customerFilterTab, setCustomerFilterTab] = useState('all') // all | active | cleared | overdue
  const [salesSearchQuery, setSalesSearchQuery] = useState('')
  const [salesStartDate, setSalesStartDate] = useState('')
  const [salesEndDate, setSalesEndDate] = useState('')
  const [salesStatusFilter, setSalesStatusFilter] = useState('All Statuses')
  const [salesPage, setSalesPage] = useState(1)
  const salesPerPage = 10
  const [salesViewMode, setSalesViewMode] = useState('card')

  useEffect(() => {
    setSalesPage(1)
  }, [salesSearchQuery, salesStartDate, salesEndDate, salesStatusFilter])

  const [expenseSearchQuery, setExpenseSearchQuery] = useState('')
  const [expenseStatusFilter, setExpenseStatusFilter] = useState('All') // All | Paid | Pending
  
  // Custom Alert Modal State
  const [customAlert, setCustomAlert] = useState(null)
  const showAlert = (message, title = 'Notice', type = 'info') => {
    setCustomAlert({ message, title, type })
  }

  // Shadow native alert with custom themed dialog
  const alert = (message) => {
    let type = 'info'
    let title = 'System Notification'
    let friendlyMessage = String(message)
    const lower = String(message).toLowerCase()
    
    // Custom friendly mappings
    if (lower.includes('invalid credentials') || lower.includes('invalid username or password')) {
      type = 'error'
      title = 'Sign In Failed'
      friendlyMessage = 'The username or password you entered is incorrect. Please check your credentials and try again.'
    } else if (lower.includes('enter both username and password')) {
      type = 'error'
      title = 'Credentials Required'
      friendlyMessage = 'Both username and password are required to access the console. Please fill in both fields.'
    } else if (lower.includes('network error trying to connect to server') || lower.includes('network error trying to connect')) {
      type = 'error'
      title = 'Connection Issues'
      friendlyMessage = 'We are unable to reach the Frozen True servers. Please check your internet connection and try again.'
    } else if (lower.includes('fill in all required fields')) {
      type = 'error'
      title = 'Missing Fields'
      friendlyMessage = 'Some required fields are empty. Please check the form and fill in all mandatory details.'
    } else if (lower.includes('vendor / supplier name') || lower.includes('vendor or supplier name')) {
      type = 'error'
      title = 'Vendor Required'
      friendlyMessage = 'Please enter the Vendor/Supplier name to record this pending invoice.'
    } else if (lower.includes('enter a shop name')) {
      type = 'error'
      title = 'Shop Name Required'
      friendlyMessage = 'A customer shop name is required. Please enter the name of the shop.'
    } else if (lower.includes('failed to create customer')) {
      type = 'error'
      title = 'Creation Failed'
      friendlyMessage = 'We could not add the customer. Please verify that the Custom ID is unique and try again.'
    } else if (lower.includes('failed to update customer')) {
      type = 'error'
      title = 'Update Failed'
      friendlyMessage = 'We could not update the customer details. Please verify the information and try again.'
    } else if (lower.includes('no sales transactions found')) {
      type = 'info'
      title = 'No History Found'
      friendlyMessage = message // keep the dynamic customer details in the message
    } else if (lower.includes('pdf library is not loaded')) {
      type = 'info'
      title = 'Print Utility Fallback'
      friendlyMessage = 'The PDF generation library is not fully loaded yet. Falling back to the browser\'s native print tool.'
    } else if (lower.includes('reset password')) {
      type = 'info'
      title = 'Reset Password'
      friendlyMessage = 'Password resets must be processed by your system administrator. Please reach out to your administrator to change your password.'
    } else if (lower.includes('admin@frozentrue.com')) {
      type = 'info'
      title = 'Access Request'
      friendlyMessage = 'To register on the Frozen True network, please contact the support team at admin@frozentrue.com.'
    } else if (lower.includes('valid budget amount')) {
      type = 'error'
      title = 'Invalid Budget'
      friendlyMessage = 'Please enter a valid, positive number to set your monthly expense budget.'
    } else if (lower.includes('error') || lower.includes('failed') || lower.includes('unable')) {
      type = 'error'
      title = 'Action Failed'
    } else if (lower.includes('required') || lower.includes('please enter')) {
      type = 'error'
      title = 'Input Required'
    } else if (lower.includes('success') || lower.includes('completed') || lower.includes('saved')) {
      type = 'success'
      title = 'Success'
    }

    showAlert(friendlyMessage, title, type)
  }

  // Profile dropdown & header search states
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [isHeaderSearchOpen, setIsHeaderSearchOpen] = useState(false)
  const profileDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  // Load more expenses states
  const [expensesVisibleCount, setExpensesVisibleCount] = useState(5)
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false)

  useEffect(() => {
    setExpensesVisibleCount(5)
  }, [expenseSearchQuery, expenseStatusFilter])
  
  // Drilldown statements
  const [stmtStartDate, setStmtStartDate] = useState('')
  const [stmtEndDate, setStmtEndDate] = useState('')

  // Splash screen transition timer
  useEffect(() => {
    if (view === 'splash') {
      const interval = setInterval(() => {
        setSplashProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            const checkSession = async () => {
              try {
                const response = await fetch(`${API_BASE_URL}/api/current-user/`)
                if (response.ok) {
                  const data = await response.json()
                  setUserProfile(data)
                  setView('dashboard')
                } else {
                  localStorage.removeItem('ft_session')
                  setView('login')
                }
              } catch (e) {
                // offline fallback
                const savedSession = localStorage.getItem('ft_session')
                if (savedSession) {
                  try {
                    setUserProfile(JSON.parse(savedSession))
                    setView('dashboard')
                  } catch (err) {
                    setView('login')
                  }
                } else {
                  setView('login')
                }
              }
            }
            checkSession()
            return 100
          }
          return prev + Math.floor(Math.random() * 8) + 4
        })
      }, 80)
      return () => clearInterval(interval)
    }
  }, [view])

  // Fetch data on application launch or dashboard load
  useEffect(() => {
    if (view === 'dashboard') {
      fetchDashboardOverview()
      fetchCustomers()
      fetchSales()
      fetchExpenses()
    }
  }, [view])

  // Auto-clear Toast notification banner
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(''), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // API Call: Fetch Dashboard Overview
  const fetchDashboardOverview = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/overview/`)
      if (response.ok) {
        const data = await response.json()
        const savedBudget = localStorage.getItem('budgeted_expenses')
        const budgeted_expenses = savedBudget ? parseFloat(savedBudget) : (data.metrics.budgeted_expenses || 45000.00)
        
        const expenses_growth_percentage = data.metrics.expenses_growth_percentage !== undefined 
          ? data.metrics.expenses_growth_percentage 
          : (data.metrics.total_expenses_previous_month > 0 
              ? Math.round(((data.metrics.total_expenses_current_month - data.metrics.total_expenses_previous_month) / data.metrics.total_expenses_previous_month) * 100 * 10) / 10
              : 4.2)

        setMetrics({
          ...data.metrics,
          budgeted_expenses,
          expenses_growth_percentage
        })
        setTrend30Days(data.trend_30_days)
        setRecentActivity(data.recent_activity)
      }
    } catch (e) {
      console.warn('API error fetching overview, falling back to mock data:', e)
    }
  }

  // API Call: Fetch Customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (e) {
      console.warn('API error fetching customers, falling back to mock data:', e)
    }
  }

  // API Call: Fetch Sales
  const fetchSales = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/`)
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (e) {
      console.warn('API error fetching sales, falling back to mock data:', e)
    }
  }

  // API Call: Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/expenses/`)
      if (response.ok) {
        const data = await response.json()
        setExpenses(data)
      }
    } catch (e) {
      console.warn('API error fetching expenses, falling back to mock data:', e)
    }
  }

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      alert('Please enter both username and password.')
      return
    }
    setAuthLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: password.trim() })
      })
      setAuthLoading(false)
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
        if (rememberMe) {
          localStorage.setItem('ft_session', JSON.stringify(data))
        }
        setView('dashboard')
      } else {
        const err = await response.json()
        alert(err.detail || 'Invalid username or password.')
      }
    } catch (err) {
      setAuthLoading(false)
      console.error('Login error:', err)
      alert('Network error trying to connect to server.')
    }
  }

  // Handle Log Out
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout/`, { method: 'POST' })
    } catch (e) {
      console.warn('Logout request failed:', e)
    }
    localStorage.removeItem('ft_session')
    setUserProfile(null)
    setUsername('')
    setPassword('')
    setView('login')
    setSplashProgress(0)
    setSelectedCustomerId(null)
  }

  // Handle Quick Add Sale submission
  const handleAddSale = async () => {
    if (!saleCustomer || !saleQuantity || !saleUnitPrice) {
      alert('Please fill in all required fields.')
      return
    }

    const payload = {
      customer: saleCustomer,
      quantity: parseFloat(saleQuantity),
      unit_type: saleUnitType,
      unit_price: parseFloat(saleUnitPrice),
      payment_status: salePaymentStatus,
      date: saleDate
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/sales/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        fetchSales()
        fetchDashboardOverview()
        fetchCustomers()
      } else {
        simulateNewSale(payload)
      }
    } catch (e) {
      simulateNewSale(payload)
    }

    setSaleCustomer('')
    setSaleQuantity('')
    setSaleUnitPrice('')
    setSalePaymentStatus('Pending')
    setSaleDate(new Date().toISOString().split('T')[0])
    setQuickAddOpen(false)
  }

  // Helper: Simulate sale locally
  const simulateNewSale = (payload) => {
    const matchedCustomer = customers.find(c => c.id === parseInt(payload.customer)) || customers[0]
    const newSale = {
      id: Date.now(),
      date: payload.date || new Date().toISOString().split('T')[0],
      customer_name: matchedCustomer.name,
      customer_custom_id: matchedCustomer.custom_id,
      quantity: payload.quantity,
      unit_type: payload.unit_type,
      unit_price: payload.unit_price,
      total_amount: payload.quantity * payload.unit_price,
      payment_status: payload.payment_status
    }
    
    const updatedSales = [newSale, ...sales]
    setSales(updatedSales)
    setRecentActivity(updatedSales.slice(0, 5))
    
    setCustomers(customers.map(c => {
      if (c.id === matchedCustomer.id) {
        const addedBalance = payload.payment_status === 'Paid' ? 0 : (payload.quantity * payload.unit_price)
        const newBal = c.total_outstanding_balance + addedBalance
        return {
          ...c,
          total_outstanding_balance: newBal,
          status: newBal > 0 ? 'overdue' : 'cleared'
        }
      }
      return c
    }))

    setMetrics(prev => ({
      ...prev,
      total_outstanding_receivables: prev.total_outstanding_receivables + (payload.quantity * payload.unit_price)
    }))
  }

  // Handle Quick Edit transaction status
  const handleUpdateTransactionStatus = (saleId, newStatus) => {
    const targetSale = sales.find(s => s.id === saleId)
    if (!targetSale) return

    const oldStatus = targetSale.payment_status
    if (oldStatus === newStatus) return

    const updatedSales = sales.map(s => {
      if (s.id === saleId) {
        return { ...s, payment_status: newStatus }
      }
      return s
    })
    setSales(updatedSales)
    setRecentActivity(updatedSales.slice(0, 5))

    const matchedCustomer = customers.find(c => c.name === targetSale.customer_name)
    if (matchedCustomer) {
      let balanceDiff = 0
      if (newStatus === 'Paid' && (oldStatus === 'Pending' || oldStatus === 'Overdue')) {
        balanceDiff = -targetSale.total_amount
      } else if ((newStatus === 'Pending' || newStatus === 'Overdue') && oldStatus === 'Paid') {
        balanceDiff = targetSale.total_amount
      }

      if (balanceDiff !== 0) {
        setCustomers(customers.map(c => {
          if (c.id === matchedCustomer.id) {
            const newBal = Math.max(0, c.total_outstanding_balance + balanceDiff)
            return {
              ...c,
              total_outstanding_balance: newBal,
              status: newBal > 0 ? 'overdue' : 'cleared'
            }
          }
          return c
        }))

        setMetrics(prev => ({
          ...prev,
          total_outstanding_receivables: Math.max(0, prev.total_outstanding_receivables + balanceDiff)
        }))
      }
    }

    setActionSale(prev => prev ? { ...prev, payment_status: newStatus } : null)
    setToastMessage(`Invoice #${saleId} payment status updated to ${newStatus}.`)
  }

  // Handle paying a pending supplier invoice
  const handlePaySupplier = (paymentId) => {
    const payment = pendingPayments.find(p => p.id === paymentId)
    if (!payment) return

    setPendingPayments(pendingPayments.filter(p => p.id !== paymentId))

    const newExpense = {
      id: expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) + 1 : 201,
      date: new Date().toISOString().split('T')[0],
      amount: payment.amount,
      category: payment.category,
      description: `Settled: ${payment.vendor} (Invoice #${payment.id})`
    }
    setExpenses([newExpense, ...expenses])

    setMetrics(prev => ({
      ...prev,
      total_expenses_current_month: prev.total_expenses_current_month + payment.amount
    }))

    setToastMessage(`Payment of ${formatCurrency(payment.amount)} to ${payment.vendor} recorded successfully!`)
  }

  // Handle Quick Add Expense submission
  const handleAddExpense = async () => {
    if (!expenseAmount || !expenseCategory) {
      alert('Please fill in all required fields.')
      return
    }

    if (expenseStatus === 'Pending' && !expenseVendor) {
      alert('Please enter the Vendor / Supplier Name for pending payments.')
      return
    }

    const payload = {
      amount: parseFloat(expenseAmount),
      category: expenseCategory,
      description: expenseDescription,
      date: expenseDate,
      status: expenseStatus,
      vendor: expenseVendor
    }

    if (expenseStatus === 'Pending') {
      simulateNewPendingPayment(payload)
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/api/expenses/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (response.ok) {
          fetchExpenses()
          fetchDashboardOverview()
        } else {
          simulateNewExpense(payload)
        }
      } catch (e) {
        simulateNewExpense(payload)
      }
    }

    setExpenseAmount('')
    setExpenseDescription('')
    setExpenseVendor('')
    setExpenseStatus('Paid')
    setExpenseDate(new Date().toISOString().split('T')[0])
    setQuickAddOpen(false)
  }

  // Handle Loading More Expenses
  const handleLoadMoreExpenses = () => {
    setIsLoadingExpenses(true)
    setTimeout(() => {
      setExpensesVisibleCount(prev => prev + 5)
      setIsLoadingExpenses(false)
    }, 600)
  }

  // Helper: Simulate pending payment locally
  const simulateNewPendingPayment = (payload) => {
    const newPending = {
      id: `SP-${Math.floor(Math.random() * 900) + 100}`,
      vendor: payload.vendor,
      category: payload.category,
      date: payload.date || new Date().toISOString().split('T')[0],
      amount: payload.amount,
      status: 'Pending'
    }
    setPendingPayments([newPending, ...pendingPayments])
    setToastMessage(`Pending supplier invoice from ${payload.vendor} recorded successfully!`)
  }

  // Helper: Simulate expense locally
  const simulateNewExpense = (payload) => {
    const newExpense = {
      id: Date.now(),
      date: payload.date || new Date().toISOString().split('T')[0],
      amount: payload.amount,
      category: payload.category,
      description: payload.description || `Expense: ${payload.category}`
    }

    setExpenses([newExpense, ...expenses])
    setMetrics(prev => ({
      ...prev,
      total_expenses_current_month: prev.total_expenses_current_month + payload.amount
    }))
    setToastMessage(`Expense of ${formatCurrency(payload.amount)} recorded successfully!`)
  }

  // Edit Customer Modal state
  const [editCustomerModalOpen, setEditCustomerModalOpen] = useState(false)
  const [editCustName, setEditCustName] = useState('')
  const [editCustPhone, setEditCustPhone] = useState('')
  const [editCustEmail, setEditCustEmail] = useState('')
  const [editCustCustomID, setEditCustCustomID] = useState('')

  // Handle Add Customer submission
  const handleAddCustomer = async () => {
    if (!custName) {
      alert('Please enter a shop name.')
      return
    }

    const payload = {
      name: custName,
      custom_id: custID || `FT-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: custPhone || '+91 94460 00000',
      email: custEmail || null,
      customer_type: 10 // Default to 'Shops' (ID 10)
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        setToastMessage(`Customer "${custName}" added successfully!`)
        fetchCustomers()
        setCustomerModalOpen(false)
        
        // Reset form fields
        setCustName('')
        setCustID('')
        setCustLocation('Kozhikode')
        setCustPhone('')
        setCustEmail('')
        setCustBalance('')
      } else {
        const err = await response.json()
        alert(err.detail || JSON.stringify(err) || 'Failed to create customer.')
      }
    } catch (e) {
      console.error('Add customer error:', e)
      alert('Network error adding customer.')
    }
  }

  // Handle Edit Customer submission
  const handleEditCustomer = async () => {
    if (!editCustName) {
      alert('Please enter a shop name.')
      return
    }

    const payload = {
      name: editCustName,
      phone: editCustPhone,
      email: editCustEmail || null,
      custom_id: editCustCustomID
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${selectedCustomerId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        setToastMessage(`Customer "${editCustName}" updated successfully!`)
        fetchCustomers()
        setEditCustomerModalOpen(false)
        // Refresh selected customer info
        const updated = await response.json()
        setSelectedCustomerId(updated.id)
      } else {
        const err = await response.json()
        alert(err.detail || JSON.stringify(err) || 'Failed to update customer.')
      }
    } catch (e) {
      console.error('Edit customer error:', e)
      alert('Network error updating customer.')
    }
  }

  // Formats currency string
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val)
  }

  // Filter logic for Customer directory
  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cust.custom_id.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    if (customerFilterTab === 'active') {
      return cust.total_outstanding_balance > 0
    } else if (customerFilterTab === 'cleared') {
      return cust.total_outstanding_balance === 0
    } else if (customerFilterTab === 'overdue') {
      return cust.status === 'overdue'
    }
    return true
  })

  // Filter logic for Sales Data Explorer
  const filteredSales = sales.filter(sale => {
    const nameMatch = (sale.customer_name || '').toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
                      (sale.customer_custom_id || '').toLowerCase().includes(salesSearchQuery.toLowerCase()) ||
                      String(sale.id).includes(salesSearchQuery)
    if (!nameMatch) return false

    if (salesStartDate && sale.date < salesStartDate) return false
    if (salesEndDate && sale.date > salesEndDate) return false

    if (salesStatusFilter !== 'All Statuses') {
      if (sale.payment_status !== salesStatusFilter) return false
    }

    return true
  })

  // Slicing calculations for Sales Pagination
  const indexOfLastSale = salesPage * salesPerPage
  const indexOfFirstSale = indexOfLastSale - salesPerPage
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale)
  const totalSalesPages = Math.max(1, Math.ceil(filteredSales.length / salesPerPage))

  // Filter logic for Expenses Tracker
  // Filter logic for Expenses Tracker
  const filteredExpenses = (() => {
    const combined = [
      ...expenses.map(e => ({ ...e, status: 'Paid' })),
      ...pendingPayments.map(p => ({ 
        ...p, 
        status: 'Pending', 
        description: `Pending invoice: ${p.vendor}` 
      }))
    ]

    let list = combined
    if (expenseStatusFilter !== 'All') {
      list = combined.filter(e => e.status === expenseStatusFilter)
    }

    return list.filter(exp => {
      const q = expenseSearchQuery.toLowerCase()
      return exp.category.toLowerCase().includes(q) ||
             exp.description.toLowerCase().includes(q) ||
             (exp.vendor && exp.vendor.toLowerCase().includes(q))
    })
  })()

  // Export CSV mock trigger
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Date,Customer,Item/Qty,Total,Status\n"
    filteredSales.forEach(s => {
      csvContent += `${s.date},${s.customer_name},${Math.round(s.quantity)} ${s.unit_type},${s.total_amount},${s.payment_status}\n`
    })
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `FrozenTrue_Sales_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleGenerateInvoice = () => {
    if (!selectedCustomer) {
      setToastMessage("Please select a customer first.")
      return
    }

    // Filter customer sales in period
    const customerSales = sales.filter(s => {
      const matchesCustomer = s.customer === selectedCustomer.id || s.customer_name === selectedCustomer.name;
      if (!matchesCustomer) return false;

      if (stmtStartDate && s.date < stmtStartDate) return false;
      if (stmtEndDate && s.date > stmtEndDate) return false;
      return true;
    });

    if (customerSales.length === 0) {
      alert(`No sales transactions found for ${selectedCustomer.name} in the selected date range: ${stmtStartDate || 'Beginning'} to ${stmtEndDate || 'Today'}`);
      return;
    }

    // Calculate values (no GST)
    const subtotal = customerSales.reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0);
    const grandTotal = subtotal;
    const totalPaid = customerSales
      .filter(s => s.payment_status === 'Paid')
      .reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0);
    const balanceDue = customerSales
      .filter(s => s.payment_status !== 'Paid')
      .reduce((acc, s) => acc + (parseFloat(s.total_amount) || 0), 0);

    setInvoiceData({
      customer: selectedCustomer,
      sales: customerSales,
      startDate: stmtStartDate,
      endDate: stmtEndDate,
      invoiceNo: `FT-INV-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      subtotal,
      grandTotal,
      totalPaid,
      balanceDue
    });
    setInvoiceModalOpen(true);
  }

  const handleDownloadPDF = () => {
    if (!invoiceData) return;

    setToastMessage("Generating PDF document...");
    const element = document.getElementById('invoice-print-area');
    const opt = {
      margin:       0,
      filename:     `Statement_${invoiceData.customer.name.replace(/\s+/g, '_')}_${invoiceData.invoiceNo}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { 
        scale: 2.5, 
        useCORS: true,
        onclone: (clonedDoc) => {
          const sheet = clonedDoc.getElementById('invoice-print-area');
          if (sheet) {
            sheet.style.transform = 'none';
            sheet.style.marginBottom = '0';
            sheet.style.boxShadow = 'none';
            sheet.style.border = 'none';
            sheet.style.display = 'flex';
            sheet.style.flexDirection = 'column';
            sheet.style.justifyContent = 'center';
            sheet.style.height = '297mm';
            sheet.style.boxSizing = 'border-box';
          }
        }
      },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (html2pdf) {
      html2pdf().from(element).set(opt).save().then(() => {
        setToastMessage("Download completed!");
        setTimeout(() => setToastMessage(""), 2000);
      }).catch(err => {
        console.error("PDF generation error:", err);
        setToastMessage("PDF generation failed.");
      });
    } else {
      alert("PDF library is not loaded, trying print fallback...");
      window.print();
    }
  }

  // Get active selected customer object details
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  // Fetch or generate timeline for selected customer
  const activeCustomerHistory = MOCK_CUSTOMER_HISTORY[selectedCustomerId] || [
    { date: '2023-10-24', type: 'Delivery', title: 'Block Ice Delivery', amount: -1250.00, details: '10x 10kg Blocks • INV #20394', status: 'Delivered' },
    { date: '2023-10-20', type: 'Payment', title: 'Account Payment', amount: 5000.00, details: 'Check Payment • REF #5521', status: 'Processed' },
    { date: '2023-10-15', type: 'Delivery', title: 'Tube Ice Delivery', amount: -850.00, details: '25x 2kg Packets • INV #20355', status: 'Delivered' }
  ]

  // Render individual views
  if (view === 'splash') {
    return (
      <div className="splash-container ice-gradient">
        <div id="ambient-container" className="splash-background frost-pulse-bg" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, transparent 70%)'
        }}></div>
        <main className="splash-content">
          <div className="splash-logo-circle">
            <span className="material-symbols-outlined text-primary">ac_unit</span>
          </div>
          <h1>FROZEN TRUE</h1>
          <p className="font-label-md text-on-surface-variant opacity-80" style={{ marginTop: '4px' }}>
            Supply Chain Excellence
          </p>
          <div className="w-full" style={{ marginTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="font-label-md text-primary font-bold">CALIBRATING SYSTEMS</span>
              <span className="font-label-md text-secondary">{Math.min(100, splashProgress)}%</span>
            </div>
            <div className="splash-loading-bar-container">
              <div className="splash-loading-bar-fill" style={{ width: `${splashProgress}%` }}></div>
            </div>
            <p className="text-on-surface-variant" style={{ fontSize: '13px', marginTop: '12px', fontStyle: 'italic' }}>
              Optimizing cold storage inventory...
            </p>
          </div>
        </main>
      </div>
    )
  }

  if (view === 'login') {
    return (
      <div className="login-container ice-gradient ice-pattern">
        <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] opacity-15 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,163,255,0.08) 0%, transparent 70%)'
        }}></div>
        <main className="login-card">
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
            <div className="frosted-glass" style={{
              padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-low)', border: '1px solid rgba(255, 255, 255, 0.4)', marginBottom: '16px'
            }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '40px' }}>ac_unit</span>
            </div>
            <h1>Frozen True</h1>
            <p className="font-label-md text-on-surface-variant" style={{ marginTop: '4px', letterSpacing: '0.15em' }}>OPERATIONAL EFFICIENCY</p>
          </header>

          <section className="glass-card" style={{ padding: '32px' }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px' }}>Welcome back</h2>
              <p className="text-on-surface-variant" style={{ fontSize: '14px', marginTop: '4px' }}>
                Please enter your credentials to access the console.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="filter-input-group">
                <label className="font-label-md text-outline" htmlFor="username">Username</label>
                <div className="input-icon-wrapper">
                  <span className="material-symbols-outlined field-icon">person</span>
                  <input
                    id="username"
                    type="text"
                    required
                    placeholder="j.doe@frozentrue.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="font-label-md text-outline" htmlFor="password">Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact administrator to reset password.'); }} style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>Forgot?</a>
                </div>
                <div className="input-icon-wrapper">
                  <span className="material-symbols-outlined field-icon">lock</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <input
                  id="remember"
                  type="checkbox"
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" style={{ fontSize: '13px', color: 'var(--on-surface-variant)', cursor: 'pointer' }}>
                  Remember device for 30 days
                </label>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', padding: '14px', marginTop: '8px' }} disabled={authLoading}>
                {authLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ borderTop: '1px solid var(--outline-variant)', marginTop: '32px', paddingTop: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                New to the network? <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact admin@frozentrue.com'); }} style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Contact Administrator</a>
              </p>
            </div>
          </section>

          <footer style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <a href="#" style={{ textDecoration: 'none', color: 'var(--outline)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Privacy Policy</a>
              <a href="#" style={{ textDecoration: 'none', color: 'var(--outline)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>Terms of Service</a>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--outline-variant)', fontFamily: 'var(--font-mono)' }}>© 2026 Frozen True. All rights reserved.</p>
          </footer>
        </main>

        {customAlert && (
          <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{
              maxWidth: '400px',
              width: '90%',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: 'var(--shadow-modal)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: customAlert.type === 'error' ? 'var(--error-container)' : 'var(--primary-fixed)',
                color: customAlert.type === 'error' ? 'var(--error)' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-low)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                  {customAlert.type === 'error' ? 'report_problem' : customAlert.type === 'success' ? 'check_circle' : 'info'}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--on-surface)' }}>
                {customAlert.title}
              </h3>
              <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                {customAlert.message}
              </p>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px', marginTop: '8px' }} 
                onClick={() => setCustomAlert(null)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app-container bg-animate">
      {/* Top Header Bar */}
      <header className="top-bar">
        <div className="top-bar-logo" onClick={() => { setActiveTab('dashboard'); setSelectedCustomerId(null); }}>
          <span className="material-symbols-outlined text-primary">ac_unit</span>
          <h1>Frozen True</h1>
        </div>
        <div className="top-bar-actions">
          {isHeaderSearchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              <input 
                type="text" 
                placeholder={
                  activeTab === 'sales' ? 'Search sales...' :
                  activeTab === 'expenses' ? 'Search expenses...' :
                  activeTab === 'customers' ? 'Search customers...' :
                  'Search...'
                }
                value={
                  activeTab === 'sales' ? salesSearchQuery : 
                  activeTab === 'expenses' ? expenseSearchQuery : 
                  searchQuery
                }
                onChange={(e) => {
                  const val = e.target.value;
                  if (activeTab === 'sales') setSalesSearchQuery(val);
                  else if (activeTab === 'expenses') setExpenseSearchQuery(val);
                  else setSearchQuery(val);
                }}
                style={{ 
                  width: '180px', 
                  padding: '6px 32px 6px 12px', 
                  fontSize: '13px', 
                  borderRadius: '20px', 
                  border: '1px solid var(--outline-variant)', 
                  height: '34px',
                  backgroundColor: 'var(--surface-container-low)'
                }}
                autoFocus
              />
              <button 
                style={{ background: 'transparent', border: 'none', position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--outline)', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  if (activeTab === 'sales') setSalesSearchQuery('');
                  else if (activeTab === 'expenses') setExpenseSearchQuery('');
                  else setSearchQuery('');
                  setIsHeaderSearchOpen(false);
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => setIsHeaderSearchOpen(true)}>
              <span className="material-symbols-outlined">search</span>
            </button>
          )}

          <div ref={profileDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <div 
              className="header-profile-avatar" 
              title="User Profile Menu" 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            >
              <img alt="User Profile" src="/profile_avatar.png" />
            </div>

            {isProfileDropdownOpen && (
              <div className="glass-card" style={{
                position: 'absolute',
                top: '42px',
                right: '0px',
                width: '220px',
                zIndex: 1000,
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                boxShadow: 'var(--shadow-high)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                textAlign: 'left'
              }}>
                {/* User Info Header */}
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--outline-variant)', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--on-surface)' }}>
                    {userProfile?.username || 'Admin'}
                  </div>
                  <div className="font-label-md text-outline" style={{ fontSize: '10px', marginTop: '2px', textTransform: 'uppercase' }}>
                    {userProfile?.role || 'Manager'}
                  </div>
                </div>

                {/* Profile Settings Option */}
                <button 
                  className="sidebar-item" 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'var(--on-surface-variant)'
                  }}
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    alert('Profile settings console is under development.');
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>manage_accounts</span>
                  Profile Settings
                </button>

                {/* System Settings Option */}
                <button 
                  className="sidebar-item" 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'var(--on-surface-variant)'
                  }}
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    alert('Frozen True Settings Console. Version 2.0.4-Fidelity.');
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
                  System Settings
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--outline-variant)', margin: '4px 0' }}></div>

                {/* Logout Option */}
                <button 
                  className="sidebar-item" 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '100%',
                    color: 'var(--error)'
                  }}
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    handleLogout();
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="sidebar">
        <nav className="sidebar-menu">
          <button className={`sidebar-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedCustomerId(null); }}>
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </button>
          <button className={`sidebar-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setSelectedCustomerId(null); }}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span>{userProfile?.role === 'customer' ? 'My Purchases' : 'Sales Logs'}</span>
          </button>
          {userProfile?.role === 'manager' && (
            <>
              <button className={`sidebar-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => { setActiveTab('expenses'); setSelectedCustomerId(null); }}>
                <span className="material-symbols-outlined">payments</span>
                <span>Expense Tracker</span>
              </button>
              <button className={`sidebar-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                <span className="material-symbols-outlined">group</span>
                <span>Customers</span>
              </button>
            </>
          )}
        </nav>
        <div className="sidebar-divider"></div>
        <div style={{ marginTop: 'auto' }}>
          <button className="sidebar-item" onClick={() => alert('Frozen True Settings Console. Version 2.0.4-Fidelity.')}>
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <div>
            {/* Overview Header */}
            <section style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '28px' }}>Operations Overview</h2>
              <p className="text-on-surface-variant" style={{ fontSize: '14px', marginTop: '4px' }}>Real-time status for your ice supply chain.</p>
            </section>

            {/* Metrics cards row */}
            <section className="metrics-row" style={userProfile?.role === 'customer' ? { gridTemplateColumns: '1fr' } : {}}>
              {userProfile?.role === 'manager' && (
                <>
                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="font-label-md text-outline">TOTAL REVENUE</span>
                      <span className="metric-growth-badge positive">+{metrics.revenue_growth_percentage}%</span>
                    </div>
                    <div className="metric-value text-primary">{formatCurrency(metrics.total_revenue_current_month)}</div>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>This Month</span>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <span className="font-label-md text-outline">TOTAL EXPENSES</span>
                      <span className="metric-growth-badge positive" style={{ backgroundColor: 'var(--outline-variant)', color: 'var(--on-surface)' }}>+4.2%</span>
                    </div>
                    <div className="metric-value">{formatCurrency(metrics.total_expenses_current_month)}</div>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('expenses'); }} style={{ fontSize: '13px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                      Breakdown
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </a>
                  </div>
                </>
              )}

              <div className="metric-card" style={{ border: '1px solid rgba(239,68,68,0.2)', backgroundColor: 'var(--surface-container-low)' }}>
                <div className="metric-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="material-symbols-outlined text-error" style={{ fontSize: '18px' }}>priority_high</span>
                    <span className="font-label-md text-error">{userProfile?.role === 'customer' ? 'MY OUTSTANDING BALANCE' : 'PENDING DUE'}</span>
                  </div>
                </div>
                <div className="metric-value text-error">{formatCurrency(metrics.total_outstanding_receivables)}</div>
                <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', fontStyle: 'italic' }}>
                  {userProfile?.role === 'customer' ? 'Please complete your pending payments' : 'High Priority'}
                </span>
              </div>

              {userProfile?.role === 'manager' && (
                <div className="metric-card" style={{ border: '1px solid rgba(16,185,129,0.2)', backgroundColor: 'var(--surface-container-low)' }}>
                  <div className="metric-header">
                    <span className="font-label-md text-outline" style={{ color: 'green' }}>NET PROFIT</span>
                    <span className="metric-growth-badge positive" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'green' }}>
                      {((metrics.total_revenue_current_month - metrics.total_expenses_current_month) / metrics.total_revenue_current_month * 100).toFixed(1)}% Margin
                    </span>
                  </div>
                  <div className="metric-value" style={{ color: 'green' }}>
                    {formatCurrency(metrics.total_revenue_current_month - metrics.total_expenses_current_month)}
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>This Month</span>
                </div>
              )}
            </section>

            {/* Sales Trend Chart */}
            <section style={{ marginBottom: '32px' }}>
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', zIndex: 10 }}>
                  <h3>Sales Trend</h3>
                  <CustomSelect
                    value={trendRange}
                    onChange={setTrendRange}
                    options={['Last Month (Weekly)', 'Last 30 Days (Daily)', 'Last 6 Months', 'Last Year (Monthly)']}
                    compact
                  />
                </div>
                
                <div className="chart-container">
                  <div className="chart-background-icon">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                  </div>
                  <div className="chart-bars">
                    {(() => {
                      const currentChartData = getChartData()
                      const maxVal = Math.max(...currentChartData.map(t => t.amount), 1)
                      return currentChartData.map((bar, i) => {
                        const pct = Math.round((bar.amount / maxVal) * 85) + 10
                        return (
                          <div key={`${trendRange}-${i}`} className="chart-bar-col">
                            <div 
                              className="chart-bar-fill" 
                              style={{ 
                                '--bar-height': `${pct}%`, 
                                height: `${pct}%`,
                                animationDelay: `${i * 80}ms`
                              }}
                            >
                              <div className="chart-bar-tooltip">{formatCurrency(bar.amount)}</div>
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>
                
                <div className="chart-labels font-label-md">
                  {(() => {
                    const currentChartData = getChartData()
                    return (
                      <>
                        <span>{currentChartData[0]?.label || 'Start'}</span>
                        <span>{currentChartData[Math.floor(currentChartData.length / 2)]?.label || 'Mid'}</span>
                        <span>{currentChartData[currentChartData.length - 1]?.label || 'End'}</span>
                      </>
                    )
                  })()}
                </div>
              </div>
            </section>

            {/* Optimized Recent Logs (Customer, Status, Amount) */}
            <section style={{ marginBottom: '48px' }}>
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3>Recent Logs</h3>
                  <div className="search-input-wrapper">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      placeholder="Search customer..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="table-container">
                  <table style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '40%' }}>Customer</th>
                        <th style={{ width: '30%', textAlign: 'center' }}>Status</th>
                        <th style={{ width: '30%', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity
                        .filter(act => act.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((act) => (
                          <tr key={act.id} className="hoverable" onClick={() => {
                            const foundCust = customers.find(c => c.name === act.customer_name)
                            if (foundCust) {
                              setSelectedCustomerId(foundCust.id)
                              setActiveTab('customers')
                            }
                          }}>
                            <td className="truncate" style={{ fontWeight: '500' }}>
                              {act.customer_name}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge ${act.payment_status === 'Paid' ? 'badge-paid' : act.payment_status === 'Pending' ? 'badge-pending' : 'badge-overdue'}`}>
                                {act.payment_status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              {formatCurrency(act.total_amount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-sm bg-surface-container-low/50 flex justify-center">
                  <button className="btn btn-ghost font-label-md text-xs uppercase" onClick={() => setActiveTab('sales')}>
                    View All Transactions
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'sales' && (
          <div>
            {/* Sales Explorer Header */}
            <section style={{ marginBottom: '32px', display: 'flex', justifycontent: 'space-between', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p className="font-label-md text-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>Operations Dashboard</p>
                <h2 style={{ fontSize: '28px' }}>Sales Data Explorer</h2>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-outline" onClick={handleExportCSV}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  Export CSV
                </button>
                <button className="btn btn-primary" onClick={() => { setQuickAddTab('sale'); setQuickAddOpen(true); }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  New Invoice
                </button>
              </div>
            </section>

            {/* Filtering Bento Bar */}
            <section className="filters-grid">
              <div className="filter-input-group glass-card" style={{ padding: '16px' }}>
                <label className="filter-label">Customer Search</label>
                <div className="search-input-wrapper">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    type="text"
                    placeholder="Search accounts..."
                    value={salesSearchQuery}
                    onChange={(e) => setSalesSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                <div className="filter-input-group" style={{ flex: 1 }}>
                  <label className="filter-label">Start Date</label>
                  <input
                    type="date"
                    value={salesStartDate}
                    onChange={(e) => setSalesStartDate(e.target.value)}
                  />
                </div>
                <div className="filter-input-group" style={{ flex: 1 }}>
                  <label className="filter-label">End Date</label>
                  <input
                    type="date"
                    value={salesEndDate}
                    onChange={(e) => setSalesEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'end', gap: '12px', position: 'relative', zIndex: 10 }}>
                <div className="filter-input-group" style={{ flex: 1 }}>
                  <label className="filter-label">Payment Status</label>
                  <CustomSelect value={salesStatusFilter} onChange={setSalesStatusFilter} options={['All Statuses', 'Paid', 'Pending', 'Overdue']} />
                </div>
                <button 
                  type="button" 
                  className={`btn ${salesViewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                  style={{ height: '42px', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
                  onClick={() => setSalesViewMode(prev => prev === 'table' ? 'card' : 'table')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_chart</span>
                  Table View
                </button>
              </div>
            </section>

            {/* Sales Table */}
            <section style={{ marginBottom: '48px' }}>
              <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {/* Table View */}
                {salesViewMode === 'table' && (
                  <div className="table-container" style={{ overflowX: 'auto' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>Item/Qty</th>
                          <th>Total</th>
                          <th>Status</th>
                          {userProfile?.role === 'manager' && <th style={{ width: '48px' }}></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {currentSales.length > 0 ? (
                          currentSales.map((sale) => (
                            <tr key={sale.id} className="hoverable">
                              <td>{new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                              <td>
                                <div style={{ fontWeight: '500' }}>{sale.customer_name}</div>
                                <div className="table-subtitle">{sale.customer_custom_id || 'Retail Cust'}</div>
                              </td>
                              <td>{Math.round(sale.quantity)} {sale.unit_type}</td>
                              <td style={{ fontWeight: '600' }}>{formatCurrency(sale.total_amount)}</td>
                              <td>
                                <span className={`badge ${sale.payment_status === 'Paid' ? 'badge-paid' : sale.payment_status === 'Pending' ? 'badge-pending' : 'badge-overdue'}`}>
                                  {sale.payment_status}
                                </span>
                              </td>
                              {userProfile?.role === 'manager' && (
                                <td>
                                  <button 
                                    className="btn btn-ghost" 
                                    style={{ padding: '4px' }} 
                                    onClick={() => {
                                      setActionSale(sale)
                                      setActionModalOpen(true)
                                      setShowReceiptPreview(false)
                                    }}
                                  >
                                    <span className="material-symbols-outlined">more_vert</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)' }}>
                              No transactions match the search filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cards View */}
                {salesViewMode === 'card' && (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {currentSales.length > 0 ? (
                      currentSales.map((sale, idx) => (
                        <div 
                          key={sale.id} 
                          style={{ 
                            padding: '16px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            gap: '12px',
                            borderBottom: idx < currentSales.length - 1 ? '1px solid var(--outline-variant)' : 'none',
                            cursor: userProfile?.role === 'manager' ? 'pointer' : 'default'
                          }} 
                          className="hoverable"
                          onClick={() => {
                            if (userProfile?.role === 'manager') {
                              setActionSale(sale)
                              setActionModalOpen(true)
                              setShowReceiptPreview(false)
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px', 
                              backgroundColor: 'var(--secondary-container)', 
                              color: 'var(--primary)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>receipt_long</span>
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--on-surface)' }}>{sale.customer_name}</div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                                <span className="table-subtitle">{sale.customer_custom_id || 'Retail Cust'}</span>
                                <span style={{ fontSize: '10px', color: 'var(--outline)' }}>•</span>
                                <span className="table-subtitle">{new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--on-surface)', fontFamily: 'var(--font-mono)' }}>
                              {formatCurrency(sale.total_amount)}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '11px', color: 'var(--outline)' }}>{Math.round(sale.quantity)} {sale.unit_type}</span>
                              <span className={`badge ${sale.payment_status === 'Paid' ? 'badge-paid' : sale.payment_status === 'Pending' ? 'badge-pending' : 'badge-overdue'}`} style={{ fontSize: '9px', padding: '1px 6px' }}>
                                {sale.payment_status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '32px', textAlign: 'center', color: 'var(--outline)' }}>
                        No transactions match the search filters.
                      </div>
                    )}
                  </div>
                )}

                <div className="pagination-row">
                  <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                    Showing {filteredSales.length === 0 ? 0 : indexOfFirstSale + 1} to {Math.min(indexOfLastSale, filteredSales.length)} of {filteredSales.length} entries
                  </span>
                  <div className="pagination-btn-group">
                    <button 
                      className="pagination-btn" 
                      disabled={salesPage === 1}
                      onClick={() => setSalesPage(prev => Math.max(1, prev - 1))}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
                    </button>
                    {Array.from({ length: totalSalesPages }, (_, i) => i + 1).map((number) => (
                      <button 
                        key={number} 
                        className={`pagination-btn ${salesPage === number ? 'active' : ''}`}
                        onClick={() => setSalesPage(number)}
                      >
                        {number}
                      </button>
                    ))}
                    <button 
                      className="pagination-btn" 
                      disabled={salesPage === totalSalesPages}
                      onClick={() => setSalesPage(prev => Math.min(totalSalesPages, prev + 1))}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'expenses' && userProfile?.role === 'manager' && (
          <div>
            {/* Expenses Explorer Header */}
            <section style={{ marginBottom: '32px' }}>
              <p className="font-label-md text-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>Operations Dashboard</p>
              <h2 style={{ fontSize: '28px' }}>Expenses Management</h2>
            </section>

            {/* Expenses Summary Bento */}
            <section className="filters-grid" style={{ marginBottom: '32px' }}>
              {/* Total Expenses Card */}
              <div className="glass-card expenses-total-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-48px', right: '-48px', width: '192px', height: '192px', borderRadius: '50%', backgroundColor: 'rgba(0,163,255,0.05)', filter: 'blur(40px)' }}></div>
                <div>
                  <span className="font-label-md text-on-surface-variant uppercase">TOTAL EXPENSES (THIS MONTH)</span>
                  <h2 className="text-primary" style={{ fontSize: '36px', fontWeight: '800', marginTop: '8px' }}>{formatCurrency(metrics.total_expenses_current_month)}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '8px', color: 'var(--on-secondary-fixed-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>trending_up</span>
                    <span>{metrics.expenses_growth_percentage}% increase from last month</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '24px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                    <span className="font-label-md text-outline" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Budgeted
                      {!isEditingBudget && (
                        <button 
                          onClick={() => {
                            setTempBudget(metrics.budgeted_expenses || 45000);
                            setIsEditingBudget(true);
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '2px', color: 'var(--primary)' }}
                          title="Edit Budget"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                        </button>
                      )}
                    </span>
                    {isEditingBudget ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <input
                          type="number"
                          value={tempBudget}
                          onChange={(e) => setTempBudget(e.target.value)}
                          style={{ width: '80px', padding: '1px 4px', fontSize: '13px', borderRadius: '4px', border: '1px solid var(--primary)', height: '24px' }}
                          autoFocus
                        />
                        <button 
                          onClick={() => {
                            const newBudget = parseFloat(tempBudget);
                            if (!isNaN(newBudget) && newBudget >= 0) {
                              setMetrics(prev => ({
                                ...prev,
                                budgeted_expenses: newBudget
                              }));
                              localStorage.setItem('budgeted_expenses', String(newBudget));
                              setIsEditingBudget(false);
                            } else {
                              alert('Please enter a valid budget amount.');
                            }
                          }}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'green', padding: '1px' }}
                          title="Save"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
                        </button>
                        <button 
                          onClick={() => setIsEditingBudget(false)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--error)', padding: '1px' }}
                          title="Cancel"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>
                        {formatCurrency(metrics.budgeted_expenses || 45000)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--outline-variant)', paddingLeft: '20px', minWidth: '100px' }}>
                    <span className="font-label-md text-outline">Remaining</span>
                    <span className="text-secondary" style={{ fontSize: '16px', fontWeight: '600', marginTop: '4px' }}>
                      {formatCurrency((metrics.budgeted_expenses || 45000) - metrics.total_expenses_current_month)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--outline-variant)', paddingLeft: '20px', minWidth: '100px' }}>
                    <span className="font-label-md text-outline">Total (All Time)</span>
                    <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--primary)', marginTop: '4px' }}>
                      {formatCurrency(expenses.reduce((acc, e) => acc + e.amount, 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Payments Card */}
              <div className="glass-card" style={{ backgroundColor: 'rgba(210,228,251,0.35)', border: '1px solid rgba(0,163,255,0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-low)' }}>
                      <span className="material-symbols-outlined text-primary">pending_actions</span>
                    </div>
                    <span className="font-label-md text-on-surface-variant uppercase">Pending Payments</span>
                  </div>
                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--on-surface)' }}>
                    {formatCurrency(pendingPayments.reduce((acc, p) => acc + p.amount, 0))}
                  </h2>
                </div>
                <button className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }} onClick={() => setPendingModalOpen(true)}>
                  Review Pending
                </button>
              </div>
            </section>

            {/* Breakdown & Transactions Table */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '48px' }} className="md:grid md:grid-cols-3">
              {/* Category Breakdown list */}
              <div className="glass-card" style={{ gridColumn: 'span 1' }}>
                <h3 className="font-label-md text-on-surface-variant uppercase mb-md">Breakdown by Category</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {getCategoryBreakdown().map(cat => (
                    <div 
                      key={cat.name} 
                      style={{ display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer', padding: '4px', borderRadius: '8px' }}
                      onClick={() => setExpenseSearchQuery(cat.name)}
                      className="hoverable-item"
                      title={`Filter by ${cat.name}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                          {cat.name}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>{formatCurrency(cat.val)}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-container)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ width: cat.w, height: '100%', backgroundColor: cat.color, borderRadius: '9999px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Table list */}
              <div className="glass-card" style={{ gridColumn: 'span 2', padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 className="font-label-md text-on-surface-variant uppercase">Recent Transactions</h3>
                  <div className="search-input-wrapper">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={expenseSearchQuery}
                      onChange={(e) => setExpenseSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Filters & Active Category Indicator */}
                <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }} className="hide-scrollbar">
                  {['All', 'Paid', 'Pending'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setExpenseStatusFilter(status)}
                      style={{ 
                        padding: '6px 16px', fontSize: '12px', flex: 'none', borderRadius: '20px', 
                        border: '1px solid var(--outline-variant)', 
                        background: expenseStatusFilter === status ? 'var(--primary-container)' : 'var(--surface-container-lowest)', 
                        color: expenseStatusFilter === status ? 'var(--on-primary-container)' : 'var(--on-surface-variant)',
                        cursor: 'pointer', fontWeight: expenseStatusFilter === status ? '600' : '500'
                      }}
                      className="hoverable"
                    >
                      {status}
                    </button>
                  ))}
                  {expenseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setExpenseSearchQuery('')}
                      style={{ 
                        marginLeft: 'auto', padding: '6px 12px', fontSize: '11px', borderRadius: '20px', 
                        border: '1px dashed var(--primary)', background: 'rgba(0,163,255,0.03)', 
                        color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                        fontWeight: '600'
                      }}
                    >
                      Clear Category: {expenseSearchQuery}
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                    </button>
                  )}
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ width: '48px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.length > 0 ? (
                        filteredExpenses.slice(0, expensesVisibleCount).map((exp) => (
                          <tr key={`${exp.status}-${exp.id}`} className="hoverable">
                            <td>{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                            <td>
                              <div style={{ fontWeight: '500' }}>{exp.vendor || exp.description}</div>
                              <div className="table-subtitle">{exp.category}</div>
                            </td>
                            <td>
                              <span className={`badge ${exp.status === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                                {exp.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: exp.status === 'Pending' ? 'var(--on-surface)' : 'var(--primary)' }}>
                              {formatCurrency(exp.amount)}
                            </td>
                            <td>
                              <button 
                                type="button" 
                                className="btn btn-ghost" 
                                style={{ padding: '4px' }} 
                                onClick={() => {
                                  if (exp.status === 'Pending') {
                                    handlePaySupplier(exp.id)
                                  } else {
                                    setSelectedExpense(exp)
                                    setExpenseModalOpen(true)
                                  }
                                }}
                                title={exp.status === 'Pending' ? 'Pay supplier bill' : 'View expense details'}
                              >
                                <span className="material-symbols-outlined">
                                  {exp.status === 'Pending' ? 'payment' : 'info'}
                                </span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)' }}>
                            No expenses logged matching search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {filteredExpenses.length > expensesVisibleCount && (
                  <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--outline-variant)' }}>
                    <button 
                      className="btn btn-ghost font-label-md uppercase" 
                      style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }} 
                      onClick={handleLoadMoreExpenses}
                      disabled={isLoadingExpenses}
                    >
                      {isLoadingExpenses ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More Transactions
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'customers' && userProfile?.role === 'manager' && (
          <div>
            {selectedCustomerId === null ? (
              <div>
                {/* Redesigned Customer Directory List */}
                <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'end', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <p className="font-label-md text-primary" style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}>Master Directory</p>
                    <h2 style={{ fontSize: '28px' }}>Customers &amp; Receivables</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="frosted-glass" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <span className="font-label-md text-outline" style={{ fontSize: '10px' }}>TOTAL OUTSTANDING</span>
                      <span className="font-headline-md text-primary" style={{ fontSize: '18px', fontWeight: '700' }}>
                        {formatCurrency(customers.reduce((acc, c) => acc + c.total_outstanding_balance, 0))}
                      </span>
                    </div>
                    <div className="frosted-glass" style={{ padding: '8px 16px', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <span className="font-label-md text-outline" style={{ fontSize: '10px' }}>ACTIVE SHOPS</span>
                      <span className="font-headline-md" style={{ fontSize: '18px', fontWeight: '700' }}>{customers.length}</span>
                    </div>
                  </div>
                </section>

                <section style={{ marginBottom: '24px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <span className="material-symbols-outlined text-outline" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', fontSize: '20px' }}>
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search customers or shop ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%', padding: '12px 16px 12px 48px', backgroundColor: 'var(--surface-container-lowest)',
                        border: '1px solid var(--outline-variant)', borderRadius: '12px', fontSize: '15px',
                        boxShadow: 'var(--shadow-low)', outline: 'none'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '16px', padding: '4px 0' }} className="hide-scrollbar">
                    <button className={`btn-pill-filter ${customerFilterTab === 'all' ? 'active' : ''}`} onClick={() => setCustomerFilterTab('all')}>All Shops</button>
                    <button className={`btn-pill-filter ${customerFilterTab === 'active' ? 'active' : ''}`} onClick={() => setCustomerFilterTab('active')}>Active</button>
                    <button className={`btn-pill-filter ${customerFilterTab === 'overdue' ? 'active' : ''}`} onClick={() => setCustomerFilterTab('overdue')}>Overdue</button>
                    <button className={`btn-pill-filter ${customerFilterTab === 'new' ? 'active' : ''}`} onClick={() => setCustomerFilterTab('new')}>New</button>
                  </div>
                </section>

                {/* Card Directory Grid */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((cust) => (
                      <div key={cust.id} className="customer-card-redesigned" onClick={() => setSelectedCustomerId(cust.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div className={`customer-avatar-redesigned ${
                            cust.icon === 'store' ? 'bg-primary-fixed text-on-primary-fixed' : 
                            cust.icon === 'ac_unit' ? 'bg-secondary-container text-on-secondary-container' : 
                            cust.icon === 'factory' ? 'bg-surface-container-highest text-on-surface-variant' : 
                            'bg-primary-fixed text-on-primary-fixed'
                          }`}>
                            <span className="material-symbols-outlined">
                              {cust.icon || 'store'}
                            </span>
                          </div>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--on-surface)' }}>{cust.name}</h3>
                            <p className="font-label-md text-outline" style={{ fontSize: '11px', textTransform: 'uppercase', marginTop: '2px' }}>
                              {cust.custom_id} • {cust.location || 'Kozhikode'}
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ textAlign: 'right', marginRight: '8px' }}>
                            {cust.status === 'overdue' ? (
                              <>
                                <p className="font-label-md text-error" style={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>Overdue</p>
                                <p className="font-label-md text-error font-bold" style={{ fontSize: '12px' }}>{formatCurrency(cust.total_outstanding_balance)}</p>
                              </>
                            ) : (
                              <>
                                <p className="font-label-md text-outline" style={{ fontSize: '10px', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' }}>Balance</p>
                                <p className={`font-label-md font-bold ${cust.total_outstanding_balance > 0 ? 'text-primary' : 'text-on-surface-variant'}`} style={{ fontSize: '12px' }}>
                                  {formatCurrency(cust.total_outstanding_balance)}
                                </p>
                              </>
                            )}
                          </div>
                          <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="frosted-glass" style={{ textAlign: 'center', padding: '32px', color: 'var(--outline)', borderRadius: '12px' }}>
                      No customer matches the search.
                    </div>
                  )}

                  {/* Visual Illustration Card Banner */}
                  <div className="mt-lg relative rounded-2xl overflow-hidden h-40 shadow-lg" style={{ marginTop: '32px', position: 'relative', height: '160px', borderRadius: '16px', overflow: 'hidden' }}>
                    <div className="w-full h-full bg-cover bg-center" style={{
                      backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCc6pYQqAI6GUn4ndc4YNIAF_gTnmCztFvOOO2C1lOaubD3k5Vbm0z7i7SA_8AS8NqXcH5XqkBXTq-V4wKOiZ9ENexmDXO6YTTxBgMVXuHDZQ2S3QZO5SQsCzAoIbe4FKqSFzD34rYP6HFviA3C3LJAjrMSnJc1U3DX8urm1O7LBFXe_aVljqr7YFXh8-oVIlf2X-rNMfp52q12kOcWXTwkJ2OleoAeVzusMCzzOacZBj7I_nYiaVPR')",
                      height: '100%', width: '100%', backgroundSize: 'cover', backgroundPosition: 'center'
                    }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-sm" style={{ padding: '16px', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                      <span className="font-label-md text-primary-fixed-dim uppercase tracking-widest" style={{ fontSize: '10px', color: '#cfe5ff' }}>Network Overview</span>
                      <h4 className="text-white font-headline-md text-body-lg font-bold" style={{ color: '#ffffff', fontSize: '18px', marginTop: '4px' }}>24 Active Partners</h4>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div>
                {/* Redesigned Customer Details drill-down view */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button className="btn btn-outline" style={{ padding: '8px', borderRadius: '50%' }} onClick={() => setSelectedCustomerId(null)}>
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                      <span className="font-label-md text-primary" style={{ letterSpacing: '0.1em' }}>CUSTOMER DETAILS</span>
                      <h2 style={{ fontSize: '28px', marginTop: '4px' }}>{selectedCustomer.name}</h2>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {userProfile?.role === 'manager' && (
                      <button 
                        className="btn btn-outline" 
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }} 
                        onClick={() => {
                          setEditCustName(selectedCustomer.name)
                          setEditCustPhone(selectedCustomer.phone || '')
                          setEditCustEmail(selectedCustomer.email || '')
                          setEditCustCustomID(selectedCustomer.custom_id || '')
                          setEditCustomerModalOpen(true)
                        }}
                      >
                        <span className="material-symbols-outlined">edit</span>
                        Edit Details
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '12px' }} onClick={handleGenerateInvoice}>
                      <span className="material-symbols-outlined">receipt_long</span>
                      Print Statement
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <section className="metrics-row hide-scrollbar" style={{ marginBottom: '24px' }}>
                  {/* Balance Widget */}
                  <div className="metric-card glass-card">
                    <div className="metric-header">
                      <span className="font-label-md text-outline">OUTSTANDING BALANCE</span>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--error-container)', color: 'var(--error)', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_balance_wallet</span>
                      </div>
                    </div>
                    <div className="metric-value text-primary">{formatCurrency(selectedCustomer.total_outstanding_balance)}</div>
                    {selectedCustomer.total_outstanding_balance > 0 ? (
                      <p className="text-error" style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', marginTop: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                        Overdue by 12 days
                      </p>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'green', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500', marginTop: '8px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                        No Outstanding Balance
                      </p>
                    )}
                  </div>

                  {/* Total Sales Life */}
                  <div className="metric-card glass-card">
                    <div className="metric-header">
                      <span className="font-label-md text-outline">TOTAL SALES (LIFE)</span>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--surface-container-highest)', color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>trending_up</span>
                      </div>
                    </div>
                    <div className="metric-value">{formatCurrency(selectedCustomer.total_outstanding_balance > 0 ? 284500.00 : 15200.00)}</div>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '8px' }}>
                      Total of {selectedCustomer.total_outstanding_balance > 0 ? '42' : '3'} invoices
                    </span>
                  </div>

                  {/* Last Activity */}
                  <div className="metric-card glass-card">
                    <div className="metric-header">
                      <span className="font-label-md text-outline">LAST ACTIVITY DATE</span>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'var(--tertiary-fixed)', color: 'var(--tertiary)', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>schedule</span>
                      </div>
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginTop: '12px' }}>{selectedCustomer.last_activity}</h2>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '8px' }}>
                      {selectedCustomer.last_activity_desc}
                    </span>
                  </div>

                  {/* Call Customer Card */}
                  <a 
                    className="metric-card hoverable" 
                    href={`tel:${selectedCustomer.phone}`} 
                    style={{ 
                      textDecoration: 'none', 
                      cursor: 'pointer', 
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      backgroundColor: 'var(--primary)',
                      color: 'var(--on-primary)',
                      border: 'none',
                      gap: '12px',
                      padding: '24px',
                      boxShadow: 'var(--shadow-low)'
                    }}
                  >
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: '#ffffff', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: '"FILL" 1' }}>call</span>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase', color: '#ffffff' }}>
                      Call Customer
                    </span>
                  </a>
                </section>

                {/* Generate Statement inputs */}
                <section className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h3 className="text-primary" style={{ fontSize: '18px' }}>Generate Statement</h3>
                      <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Select a date range to generate a custom invoice or statement.</p>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%', maxWidth: '640px', alignItems: 'end' }}>
                      <div className="filter-input-group" style={{ flex: '1 0 160px' }}>
                        <label className="font-label-md text-outline">Start Date</label>
                        <input type="date" value={stmtStartDate} onChange={(e) => setStmtStartDate(e.target.value)} />
                      </div>
                      <div className="filter-input-group" style={{ flex: '1 0 160px' }}>
                        <label className="font-label-md text-outline">End Date</label>
                        <input type="date" value={stmtEndDate} onChange={(e) => setStmtEndDate(e.target.value)} />
                      </div>
                      <button className="btn btn-primary" style={{ flex: '1 0 160px', padding: '11px' }} onClick={handleGenerateInvoice}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
                        Generate Invoice
                      </button>
                    </div>
                  </div>
                </section>

                {/* Left/Right Split */}
                <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="md:grid md:grid-cols-3">
                  {/* Left Column: Transaction Timeline */}
                  <div className="glass-card" style={{ gridColumn: 'span 2', padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--outline-variant)', backgroundColor: 'var(--surface-container-low)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="text-primary" style={{ fontSize: '18px' }}>Transaction History</h3>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-ghost" style={{ padding: '6px' }} onClick={() => alert('Filters statement history.')}>
                          <span className="material-symbols-outlined">filter_list</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {activeCustomerHistory.map((item, idx) => (
                        <div key={idx} style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: idx < activeCustomerHistory.length - 1 ? '1px solid var(--outline-variant)' : 'none' }} className="hoverable">
                          {/* Date Block */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '56px', padding: '6px 0', backgroundColor: 'var(--surface-container-high)', borderRadius: '8px' }}>
                            <span className="font-label-md text-outline" style={{ fontSize: '9px', textTransform: 'uppercase' }}>
                              {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--on-surface)' }}>
                              {new Date(item.date).toLocaleDateString('en-US', { day: 'numeric' })}
                            </span>
                          </div>

                          {/* Info Block */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <h4 style={{ fontSize: '14px', fontWeight: '700' }}>{item.title}</h4>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: item.amount < 0 ? 'var(--on-surface)' : 'green' }}>
                                {item.amount < 0 ? `- ${formatCurrency(Math.abs(item.amount))}` : `+ ${formatCurrency(item.amount)}`}
                              </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                              <span>{item.details}</span>
                              <span className="font-label-md" style={{ fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px', backgroundColor: item.type === 'Payment' ? 'rgba(34,197,94,0.1)' : 'var(--surface-container-highest)', color: item.type === 'Payment' ? 'green' : 'var(--primary)' }}>
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <span className="material-symbols-outlined text-outline">chevron_right</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--outline-variant)' }}>
                      <button 
                        className="btn btn-ghost font-label-md uppercase" 
                        style={{ fontSize: '11px' }} 
                        onClick={() => {
                          setSalesSearchQuery(selectedCustomer.name)
                          setSalesStartDate('')
                          setSalesEndDate('')
                          setSalesStatusFilter('All Statuses')
                          setActiveTab('sales')
                          setSelectedCustomerId(null)
                        }}
                      >
                        View All Transactions
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Location & Contact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Location Card */}
                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                      <div style={{ height: '128px', backgroundColor: 'var(--surface-container-high)', position: 'relative' }}>
                        <DetailsMap locationName={selectedCustomer.location} />
                      </div>
                      <div style={{ padding: '16px' }}>
                        <span className="font-label-md text-outline" style={{ fontSize: '10px' }}>DELIVERY LOCATION</span>
                        <p style={{ fontSize: '13px', margin: '8px 0 16px', color: 'var(--on-surface)' }}>
                          Central Cold Hub, {selectedCustomer.location}, Malappuram, Kerala
                        </p>
                        <button className="btn btn-outline" style={{ width: '100%', padding: '8px' }} onClick={() => alert(`Navigating to ${selectedCustomer.location} Cold Hub...`)}>
                          OPEN IN MAPS
                        </button>
                      </div>
                    </div>

                    {/* Key Contact Card */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                      <span className="font-label-md text-outline" style={{ fontSize: '10px' }}>KEY CONTACT</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-fixed)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700' }}>
                          MR
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '15px' }}>Maria Rosales</p>
                          <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)' }}>Store Manager</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>phone</span>
                          <span>{selectedCustomer.phone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>mail</span>
                          <span style={{ wordBreak: 'break-all' }}>{selectedCustomer.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) */}
      {userProfile?.role === 'manager' && (
        activeTab === 'customers' ? (
          selectedCustomerId === null && (
            <button 
              className="fixed bottom-24 right-sm h-14 px-sm bg-primary text-on-primary rounded-full shadow-xl flex items-center gap-xs active:scale-90 duration-200 z-40 transition-all" 
              style={{
                position: 'fixed', bottom: '96px', right: '24px', height: '56px', padding: '0 24px', 
                backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '9999px',
                boxShadow: 'var(--shadow-high)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 40, border: 'none', cursor: 'pointer'
              }}
              onClick={() => setCustomerModalOpen(true)}
            >
              <span className="material-symbols-outlined" style={{ color: 'var(--on-primary)' }}>person_add</span>
              <span className="font-label-md text-label-md font-bold" style={{ color: 'var(--on-primary)', fontWeight: '700' }}>New Customer</span>
            </button>
          )
        ) : (
          <button className="fab" onClick={() => { setQuickAddTab('sale'); setQuickAddOpen(true); }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
          </button>
        )
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setSelectedCustomerId(null); }}>
          <span className="material-symbols-outlined">dashboard</span>
          <p>Dashboard</p>
        </button>
        <button className={`bottom-nav-item ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); setSelectedCustomerId(null); }}>
          <span className="material-symbols-outlined">receipt_long</span>
          <p>{userProfile?.role === 'customer' ? 'Purchases' : 'Sales'}</p>
        </button>
        {userProfile?.role === 'manager' && (
          <>
            <button className={`bottom-nav-item ${activeTab === 'expenses' ? 'active' : ''}`} onClick={() => { setActiveTab('expenses'); setSelectedCustomerId(null); }}>
              <span className="material-symbols-outlined">payments</span>
              <p>Expenses</p>
            </button>
            <button className={`bottom-nav-item ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
              <span className="material-symbols-outlined">group</span>
              <p>Customers</p>
            </button>
          </>
        )}
      </nav>

      {/* Quick Add Modal */}
      {quickAddOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">bolt</span>
                <h3 style={{ fontSize: '20px' }}>Quick Add Log</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setQuickAddOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body">
              {/* Segmented Control */}
              <div className="segmented-control" style={{ marginBottom: '20px' }}>
                <button
                  className={`segmented-tab ${quickAddTab === 'sale' ? 'active' : ''}`}
                  onClick={() => setQuickAddTab('sale')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>receipt_long</span>
                  New Sale
                </button>
                <button
                  className={`segmented-tab ${quickAddTab === 'expense' ? 'active' : ''}`}
                  onClick={() => setQuickAddTab('expense')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                  New Expense
                </button>
              </div>

              {/* Form Render based on segment */}
              {quickAddTab === 'sale' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="filter-input-group" style={{ position: 'relative', zIndex: 30 }}>
                    <label className="font-label-md text-on-surface-variant">Customer / Shop *</label>
                    {!saleCustomer ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ position: 'relative', width: '100%' }}>
                          <span className="material-symbols-outlined text-outline" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', color: 'var(--outline)' }}>
                            search
                          </span>
                          <input
                            type="text"
                            placeholder="Type to search shop name or ID..."
                            value={saleCustomerSearchQuery}
                            onChange={(e) => setSaleCustomerSearchQuery(e.target.value)}
                            style={{ paddingLeft: '38px', fontSize: '14px' }}
                          />
                        </div>
                        {/* Auto-suggest dropdown results list */}
                        <div style={{ 
                          maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--outline-variant)', 
                          borderRadius: '8px', backgroundColor: 'var(--surface-container-lowest)', display: 'flex', flexDirection: 'column'
                        }} className="hide-scrollbar">
                          {customers.filter(c => 
                            c.name.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase()) || 
                            c.custom_id.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase()) ||
                            c.location.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase())
                          ).length > 0 ? (
                            customers.filter(c => 
                              c.name.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase()) || 
                              c.custom_id.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase()) ||
                              c.location.toLowerCase().includes(saleCustomerSearchQuery.toLowerCase())
                            ).map(c => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => {
                                  setSaleCustomer(String(c.id));
                                  setSaleCustomerSearchQuery('');
                                }}
                                style={{
                                  padding: '8px 12px', border: 'none', borderBottom: '1px solid var(--outline-variant)',
                                  background: 'transparent', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}
                                className="hoverable"
                              >
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>{c.name}</span>
                                <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase' }}>{c.custom_id} • {c.location}</span>
                              </button>
                            ))
                          ) : (
                            <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: 'var(--outline)' }}>
                              No matching shops found
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Show selected customer card
                      <div style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--primary)', 
                        backgroundColor: 'rgba(0,163,255,0.03)' 
                      }}>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--on-surface)' }}>
                            {customers.find(c => String(c.id) === String(saleCustomer))?.name}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase', marginTop: '2px' }}>
                            {customers.find(c => String(c.id) === String(saleCustomer))?.custom_id} • {customers.find(c => String(c.id) === String(saleCustomer))?.location}
                          </p>
                        </div>
                        <button 
                          type="button"
                          className="btn btn-ghost" 
                          style={{ padding: '6px 12px', fontSize: '11px', textTransform: 'uppercase' }}
                          onClick={() => setSaleCustomer('')}
                        >
                          Change
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sale Date Picker */}
                  <div className="filter-input-group">
                    <label className="font-label-md text-on-surface-variant">Sale Date *</label>
                    <input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 20 }}>
                    <div className="filter-input-group" style={{ flex: 1 }}>
                      <label className="font-label-md text-on-surface-variant">Quantity</label>
                      <div style={{ display: 'flex', position: 'relative' }}>
                        <input
                          type="number"
                          placeholder="0"
                          value={saleQuantity}
                          onChange={(e) => setSaleQuantity(e.target.value)}
                          style={{ paddingRight: '72px' }}
                        />
                        <InlineUnitSelect value={saleUnitType} onChange={setSaleUnitType} />
                      </div>
                    </div>

                    <div className="filter-input-group" style={{ flex: 1 }}>
                      <label className="font-label-md text-on-surface-variant">Price per Unit (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={saleUnitPrice}
                        onChange={(e) => setSaleUnitPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Payment Status Dropdown Selector */}
                  <div className="filter-input-group" style={{ position: 'relative', zIndex: 10 }}>
                    <label className="font-label-md text-on-surface-variant">Payment Status *</label>
                    <CustomSelect 
                      value={salePaymentStatus} 
                      onChange={setSalePaymentStatus} 
                      options={['Pending', 'Paid']} 
                    />
                  </div>

                  {/* Estimate Box */}
                  <div className="estimate-box">
                    <span className="font-label-md text-on-surface-variant">TOTAL ESTIMATE</span>
                    <span className="font-headline-md text-primary" style={{ fontSize: '24px', fontWeight: '700' }}>
                      {formatCurrency((parseFloat(saleQuantity) || 0) * (parseFloat(saleUnitPrice) || 0))}
                    </span>
                  </div>

                  <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '12px' }} onClick={handleAddSale}>
                    <span className="material-symbols-outlined">check_circle</span>
                    Save Sale Record
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="filter-input-group">
                    <label className="font-label-md text-on-surface-variant">Amount (₹) *</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      style={{ fontSize: '20px', fontWeight: '700' }}
                    />
                  </div>

                  <div className="filter-input-group">
                    <label className="font-label-md text-on-surface-variant">Category</label>
                    <div className="expense-categories-grid">
                      {['Fuel', 'Electricity', 'Maintenance', 'Labor'].map(cat => (
                        <label key={cat} className="category-radio-label">
                          <input
                            type="radio"
                            name="category"
                            checked={expenseCategory === cat}
                            onChange={() => setExpenseCategory(cat)}
                          />
                          <div className="category-radio-card">
                            <span className="material-symbols-outlined">
                              {cat === 'Fuel' ? 'local_gas_station' : cat === 'Electricity' ? 'bolt' : cat === 'Maintenance' ? 'build' : 'group'}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{cat}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Expense Status Dropdown Selector */}
                  <div className="filter-input-group" style={{ position: 'relative', zIndex: 10 }}>
                    <label className="font-label-md text-on-surface-variant">Expense Status *</label>
                    <CustomSelect 
                      value={expenseStatus} 
                      onChange={setExpenseStatus} 
                      options={['Paid', 'Pending']} 
                    />
                  </div>

                  {/* Vendor / Supplier Name field (shown only when Pending) */}
                  {expenseStatus === 'Pending' && (
                    <div className="filter-input-group">
                      <label className="font-label-md text-on-surface-variant">Vendor / Supplier Name *</label>
                      <input
                        type="text"
                        placeholder="Enter supplier or vendor name..."
                        value={expenseVendor}
                        onChange={(e) => setExpenseVendor(e.target.value)}
                      />
                    </div>
                  )}

                  {/* Expense Date Picker */}
                  <div className="filter-input-group">
                    <label className="font-label-md text-on-surface-variant">Expense Date *</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                    />
                  </div>

                  <div className="filter-input-group">
                    <label className="font-label-md text-on-surface-variant">Notes (Optional)</label>
                    <textarea
                      placeholder="Brief details about expenditure..."
                      rows="2"
                      value={expenseDescription}
                      onChange={(e) => setExpenseDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <button className="btn btn-secondary" style={{ width: '100%', padding: '14px', marginTop: '12px' }} onClick={handleAddExpense}>
                    <span className="material-symbols-outlined">receipt</span>
                    Save Expense Record
                  </button>
                </div>
              )}
            </div>

            <footer className="modal-footer" style={{ textAlign: 'center' }}>
              <p className="font-label-md text-outline" style={{ fontSize: '10px', textTransform: 'uppercase' }}>Recent Suggestions</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px', overflowX: 'auto' }} className="hide-scrollbar">
                {customers.slice(0, 3).map(c => (
                  <button
                    key={c.id}
                    className="btn-pill-filter"
                    style={{ padding: '4px 12px', fontSize: '11px', backgroundColor: '#ffffff', border: '1px solid var(--outline-variant)' }}
                    onClick={() => {
                      if (quickAddTab === 'sale') {
                        setSaleCustomer(String(c.id))
                      }
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </footer>
          </div>
        </div>
      )}
      {/* Customer Add Modal */}
      {customerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">person_add</span>
                <h3 style={{ fontSize: '20px' }}>Add Customer</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setCustomerModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Shop/Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alingal Traders"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  required
                />
              </div>

              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Custom ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FT-9902"
                  value={custID}
                  onChange={(e) => setCustID(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div className="filter-input-group" style={{ flex: '1 0 200px' }}>
                  <label className="font-label-md text-on-surface-variant">Outstanding Balance (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={custBalance}
                    onChange={(e) => setCustBalance(e.target.value)}
                  />
                </div>
                <div className="filter-input-group" style={{ flex: '1 0 200px' }}>
                  <label className="font-label-md text-on-surface-variant">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 94460 88200"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. store@email.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                />
              </div>

              {/* Interactive Map Location Selector */}
              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Select Location from Map *</label>
                <MapSelector selectedLocation={custLocation} onSelectLocation={setCustLocation} />
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-outline">Selected Hub:</span>
                  <span className="text-primary font-bold">{custLocation}</span>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }} onClick={handleAddCustomer}>
                <span className="material-symbols-outlined">person_add</span>
                Create Customer Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {editCustomerModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">edit</span>
                <h3 style={{ fontSize: '20px' }}>Edit Customer Details</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setEditCustomerModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Shop/Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Alingal Traders"
                  value={editCustName}
                  onChange={(e) => setEditCustName(e.target.value)}
                  required
                />
              </div>

              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Custom ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FT-9902"
                  value={editCustCustomID}
                  onChange={(e) => setEditCustCustomID(e.target.value)}
                />
              </div>

              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +91 94460 88200"
                  value={editCustPhone}
                  onChange={(e) => setEditCustPhone(e.target.value)}
                />
              </div>

              <div className="filter-input-group">
                <label className="font-label-md text-on-surface-variant">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. store@email.com"
                  value={editCustEmail}
                  onChange={(e) => setEditCustEmail(e.target.value)}
                />
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }} onClick={handleEditCustomer}>
                <span className="material-symbols-outlined">save</span>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
          padding: '12px 20px', borderRadius: '12px', boxShadow: 'var(--shadow-high)',
          zIndex: 2000, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600'
        }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontVariationSettings: '"FILL" 1' }}>info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Transaction Action Modal */}
      {actionModalOpen && actionSale && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <h3 style={{ fontSize: '20px' }}>Invoice #{actionSale.id.toString().slice(-6)}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setActionModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {!showReceiptPreview ? (
                <>
                  {/* Transaction info summary */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span className="text-outline">Customer:</span>
                      <span style={{ fontWeight: '700' }}>{actionSale.customer_name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span className="text-outline">Quantity logged:</span>
                      <span style={{ fontWeight: '600' }}>{Math.round(actionSale.quantity)} {actionSale.unit_type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span className="text-outline">Total Amount:</span>
                      <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{formatCurrency(actionSale.total_amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                      <span className="text-outline">Current Status:</span>
                      <span className={`badge ${actionSale.payment_status === 'Paid' ? 'badge-paid' : actionSale.payment_status === 'Pending' ? 'badge-pending' : 'badge-overdue'}`}>
                        {actionSale.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Options actions list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Status updater segmented controls */}
                    <div className="filter-input-group">
                      <label className="font-label-md text-on-surface-variant">Update Payment Status</label>
                      <div className="segmented-control">
                        {['Paid', 'Pending', 'Overdue'].map(status => (
                          <button
                            key={status}
                            type="button"
                            className={`segmented-tab ${actionSale.payment_status === status ? 'active' : ''}`}
                            onClick={() => handleUpdateTransactionStatus(actionSale.id, status)}
                            style={{ padding: '8px' }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--outline-variant)', margin: '8px 0' }} />

                    {/* Print receipt action button */}
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      style={{ width: '100%', padding: '12px', justifyContent: 'start', gap: '12px' }}
                      onClick={() => setShowReceiptPreview(true)}
                    >
                      <span className="material-symbols-outlined">print</span>
                      <span>Print Thermal Receipt</span>
                    </button>

                    {/* Email PDF simulated invoice */}
                    <button 
                      type="button"
                      className="btn btn-outline" 
                      style={{ width: '100%', padding: '12px', justifyContent: 'start', gap: '12px' }}
                      disabled={emailLoading}
                      onClick={() => {
                        setEmailLoading(true)
                        setTimeout(() => {
                          setEmailLoading(false)
                          const matchedCust = customers.find(c => c.name === actionSale.customer_name)
                          const emailDest = matchedCust?.email || `${actionSale.customer_name.toLowerCase().replace(/\s+/g, '')}@email.com`
                          setToastMessage(`Invoice PDF emailed to ${emailDest} successfully!`)
                          setActionModalOpen(false)
                        }, 1200)
                      }}
                    >
                      {emailLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin" style={{ animation: 'spin 1s linear infinite' }}>progress_activity</span>
                          <span>Generating PDF Invoice...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">mail</span>
                          <span>Email Invoice PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Thermal Receipt Preview */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    fontFamily: 'var(--font-mono)', fontSize: '12px', backgroundColor: '#fcfcfc', 
                    border: '1px dashed #ccc', padding: '24px 16px', borderRadius: '4px',
                    color: '#000', display: 'flex', flexDirection: 'column', gap: '8px',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '8px' }}>
                      *** FROZEN TRUE ***
                    </div>
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                      Malappuram District, Kerala<br/>
                      Invoice ID: #{actionSale.id.toString().slice(-8)}<br/>
                      Date: {actionSale.date}
                    </div>
                    <div style={{ borderBottom: '1px dashed #ccc', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                      <span>Item Description</span>
                      <span>Total</span>
                    </div>
                    <div style={{ borderBottom: '1px dashed #ccc', margin: '4px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>
                        {Math.round(actionSale.quantity)} {actionSale.unit_type} Ice<br/>
                        @ {formatCurrency(actionSale.unit_price)} per unit
                      </span>
                      <span>{formatCurrency(actionSale.total_amount)}</span>
                    </div>
                    <div style={{ borderBottom: '1px dashed #ccc', margin: '8px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                      <span>GRAND TOTAL</span>
                      <span>{formatCurrency(actionSale.total_amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px' }}>
                      <span>PAYMENT STATUS</span>
                      <span style={{ textTransform: 'uppercase' }}>{actionSale.payment_status}</span>
                    </div>
                    <div style={{ borderBottom: '1px dashed #ccc', margin: '8px 0' }} />
                    <div style={{ textAlign: 'center', fontSize: '10px', marginTop: '8px' }}>
                      THANK YOU FOR YOUR PARTNERSHIP!<br/>
                      Frozen True Ice Supply Chain v2.0
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      style={{ flex: 1 }} 
                      onClick={() => setShowReceiptPreview(false)}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ flex: 1 }} 
                      onClick={() => {
                        setToastMessage('Sending document to receipt printer...')
                        setTimeout(() => {
                          setActionModalOpen(false)
                        }, 500)
                      }}
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expense Detail Modal */}
      {expenseModalOpen && selectedExpense && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">payments</span>
                <h3 style={{ fontSize: '20px' }}>Expense Details</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setExpenseModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-outline">Expense ID:</span>
                  <span style={{ fontWeight: '700' }}>#{selectedExpense.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-outline">Date Logged:</span>
                  <span style={{ fontWeight: '600' }}>
                    {new Date(selectedExpense.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-outline">Category:</span>
                  <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{selectedExpense.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span className="text-outline">Total Amount:</span>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--on-surface)' }}>{formatCurrency(selectedExpense.amount)}</span>
                </div>
                
                <div style={{ borderTop: '1px solid var(--outline-variant)', margin: '8px 0' }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="text-outline" style={{ fontSize: '12px' }}>Notes / Description:</span>
                  <p style={{ 
                    fontSize: '13px', color: 'var(--on-surface-variant)', 
                    backgroundColor: 'var(--surface-container-low)', padding: '8px 12px', 
                    borderRadius: '6px', fontStyle: 'italic', margin: 0 
                  }}>
                    {selectedExpense.description || 'No additional description provided.'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px' }} 
                onClick={() => setExpenseModalOpen(false)}
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Supplier Payments Modal */}
      {pendingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">pending_actions</span>
                <h3 style={{ fontSize: '20px' }}>Pending Supplier Payments</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setPendingModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p className="text-on-surface-variant" style={{ fontSize: '13px', margin: 0 }}>
                Review and settle outstanding supplier invoices. Settling an invoice will automatically record it as an expense and update dashboard statistics.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }} className="hide-scrollbar">
                {pendingPayments.length > 0 ? (
                  pendingPayments.map(payment => (
                    <div key={payment.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{payment.vendor}</span>
                        <span style={{ fontSize: '11px', color: 'var(--outline)' }}>
                          {payment.category} • Invoice #{payment.id} • {new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '14px', marginTop: '2px' }}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <button 
                        type="button"
                        className="btn btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                        onClick={() => handlePaySupplier(payment.id)}
                      >
                        Settle &amp; Pay
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--outline)', fontStyle: 'italic', fontSize: '13px' }}>
                    All supplier invoices have been fully settled!
                  </div>
                )}
              </div>

              <button 
                type="button"
                className="btn btn-outline" 
                style={{ width: '100%', padding: '12px', marginTop: '8px' }} 
                onClick={() => setPendingModalOpen(false)}
              >
                Close list
              </button>
            </div>
          </div>
        </div>
      )}
      {invoiceModalOpen && invoiceData && (
        <div className="modal-overlay no-print" style={{ overflowY: 'auto', padding: '40px 16px', display: 'flex', alignItems: 'start', justifyContent: 'center' }}>
          <div className="invoice-modal-content">
            <header className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <h3 style={{ fontSize: '20px' }}>Statement Invoice Preview</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setInvoiceModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>
            
            <div className="modal-body" style={{ padding: '0', backgroundColor: 'var(--surface-container-low)' }}>
              <div className="invoice-preview-wrapper">
                {/* Document Print Area */}
                <div id="invoice-print-area" className="invoice-preview-sheet" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '2px solid var(--primary-container)', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '28px', fontVariationSettings: '"FILL" 1' }}>ac_unit</span>
                    </div>
                    <div>
                      <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>FROZEN TRUE</h2>
                      <span style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ice Production &amp; Distribution</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--on-surface)', margin: 0, letterSpacing: '-0.01em' }}>STATEMENT INVOICE</h1>
                    <span style={{ fontSize: '12px', color: 'var(--outline)' }}>Official Statement Document</span>
                  </div>
                </div>

                {/* Addresses / Metadata Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Billed To:</span>
                    <strong style={{ fontSize: '16px', color: 'var(--on-surface)', display: 'block' }}>{invoiceData.customer.name}</strong>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'block', marginTop: '2px' }}>Customer ID: {invoiceData.customer.custom_id}</span>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'block' }}>Phone: {invoiceData.customer.phone || 'N/A'}</span>
                    <span style={{ fontSize: '13px', color: 'var(--on-surface-variant)', display: 'block' }}>Location: {invoiceData.customer.location || 'Malappuram District, Kerala'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <div style={{ textAlign: 'left' }}>
                      <span style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>Statement Details:</span>
                      <table style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: '2px 12px 2px 0', border: 'none', color: 'var(--outline)', fontWeight: '500' }}>Statement No:</td>
                            <td style={{ padding: '2px 0', border: 'none', fontWeight: 'bold' }}>{invoiceData.invoiceNo}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 12px 2px 0', border: 'none', color: 'var(--outline)', fontWeight: '500' }}>Date of Issue:</td>
                            <td style={{ padding: '2px 0', border: 'none' }}>{invoiceData.date}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '2px 12px 2px 0', border: 'none', color: 'var(--outline)', fontWeight: '500' }}>Billing Period:</td>
                            <td style={{ padding: '2px 0', border: 'none' }}>
                              {invoiceData.startDate ? new Date(invoiceData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Beginning'} to {invoiceData.endDate ? new Date(invoiceData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Table of items */}
                <div style={{ flexGrow: 1, marginTop: '16px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface-container)', borderBottom: '2px solid var(--outline-variant)' }}>
                        <th style={{ padding: '10px 16px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--on-surface)' }}>Date</th>
                        <th style={{ padding: '10px 16px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--on-surface)' }}>Item Description</th>
                        <th style={{ padding: '10px 16px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--on-surface)', textAlign: 'right' }}>Unit Price</th>
                        <th style={{ padding: '10px 16px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--on-surface)', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '10px 16px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--on-surface)', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                      {invoiceData.sales.map((sale, idx) => (
                        <tr key={sale.id} style={{ borderBottom: '1px solid var(--outline-variant)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--surface-container-low)' }}>
                          <td style={{ padding: '12px 16px' }}>{new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td style={{ padding: '12px 16px', fontWeight: '500' }}>Ice Supply ({sale.unit_type})</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right' }}>{formatCurrency(sale.unit_price)}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>{Math.round(sale.quantity)}</td>
                          <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(sale.total_amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Invoice Summary Totals */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', marginTop: '24px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--outline)', border: '1px dashed var(--outline-variant)', borderRadius: '8px', padding: '12px' }}>
                    <strong style={{ display: 'block', color: 'var(--on-surface-variant)', fontSize: '12px', marginBottom: '6px' }}>Bank Wire Transfer Details:</strong>
                    Bank Name: State Bank of India<br />
                    Account Name: Frozen True Ice Logistics Pvt Ltd<br />
                    Account Number: 39401239841<br />
                    IFSC Code: SBIN0001042<br />
                    Branch: Kozhikode Main Office, Kerala
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--outline)' }}>Total Amount:</span>
                      <span>{formatCurrency(invoiceData.grandTotal)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#15803d' }}>
                      <span style={{ color: 'var(--outline)' }}>Amount Paid:</span>
                      <span>- {formatCurrency(invoiceData.totalPaid)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--primary)', paddingTop: '6px', fontWeight: '800', fontSize: '15px', color: 'var(--primary)' }}>
                      <span>Balance Due:</span>
                      <span>{formatCurrency(invoiceData.balanceDue)}</span>
                    </div>
                  </div>
                </div>

                {/* Signoff details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginTop: 'auto', paddingTop: '32px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--outline)', maxWidth: '320px' }}>
                    <strong>Terms &amp; Instructions:</strong><br />
                    Please transfer the balance due within 15 days of this statement issue date. All queries regarding this statement must be reported within 5 business days.
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '180px' }}>
                    <div style={{ borderBottom: '1px solid var(--outline-variant)', width: '100%', height: '36px' }}></div>
                    <span style={{ fontSize: '11px', color: 'var(--outline)', textTransform: 'uppercase', display: 'block', marginTop: '6px' }}>Authorized Signatory</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
            <footer className="modal-footer" style={{ display: 'flex', justifyContent: 'end', gap: '12px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setInvoiceModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleDownloadPDF}>
                <span className="material-symbols-outlined">download</span>
                Download PDF
              </button>
            </footer>
          </div>
        </div>
      )}

      {customAlert && (
        <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-card" style={{
            maxWidth: '400px',
            width: '90%',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'var(--shadow-modal)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: customAlert.type === 'error' ? 'var(--error-container)' : 'var(--primary-fixed)',
              color: customAlert.type === 'error' ? 'var(--error)' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-low)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                {customAlert.type === 'error' ? 'report_problem' : customAlert.type === 'success' ? 'check_circle' : 'info'}
              </span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--on-surface)' }}>
              {customAlert.title}
            </h3>
            <p className="text-on-surface-variant" style={{ fontSize: '14px', lineHeight: '1.5' }}>
              {customAlert.message}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '10px', marginTop: '8px' }} 
              onClick={() => setCustomAlert(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

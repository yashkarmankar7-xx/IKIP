const IKIP_DATA = {
  currentUser: {
    name: "Rahul Sharma",
    role: "Maintenance Engineer",
    department: "Plant Operations — Unit 2",
    employeeId: "ENG-2291",
    phone: "+91 98XXX XX210",
    email: "rahul.sharma@ikip-industries.com",
    stats: { reports: 42, machines: 18, tasks: 129 }
  },

  overview: { total: 24, healthy: 17, warning: 5, critical: 2 },

  machines: [
    { id:"M-101", name:"Motor M-101", type:"Induction Motor", manufacturer:"Siemens", installed:"Jan 2022", hours:"14,220 hrs", location:"Bay 3 — Line A",
      status:"warning", health:78, temp:71, vibration:4.8, icon:"⚙️", updated:"2 min ago" },
    { id:"P-204", name:"Pump P-204", type:"Centrifugal Pump", manufacturer:"Grundfos", installed:"Aug 2021", hours:"22,040 hrs", location:"Bay 1 — Utility",
      status:"healthy", health:94, temp:52, vibration:1.9, icon:"💧", updated:"5 min ago" },
    { id:"C-08", name:"Conveyor C-08", type:"Belt Conveyor", manufacturer:"FlexLink", installed:"Mar 2020", hours:"31,880 hrs", location:"Bay 4 — Packaging",
      status:"healthy", health:91, temp:44, vibration:1.2, icon:"📦", updated:"just now" },
    { id:"CP-17", name:"Compressor CP-17", type:"Rotary Screw Compressor", manufacturer:"Atlas Copco", installed:"Nov 2019", hours:"38,510 hrs", location:"Bay 2 — Utility",
      status:"critical", health:54, temp:89, vibration:7.6, icon:"🌀", updated:"1 min ago" },
    { id:"B-01", name:"Boiler B-01", type:"Steam Boiler", manufacturer:"Thermax", installed:"Feb 2018", hours:"44,760 hrs", location:"Bay 5 — Power House",
      status:"warning", health:73, temp:96, vibration:3.1, icon:"🔥", updated:"3 min ago" },
  ],

  engineers: ["Rahul Sharma", "Priya Verma", "Arjun Singh"],

  reports: [
    { name:"Maintenance Report — Motor M-101", type:"Maintenance Report", date:"14 Jul 2026", status:"Completed" },
    { name:"Inspection Report — Compressor CP-17", type:"Inspection Report", date:"12 Jul 2026", status:"Completed" },
    { name:"AI Analysis Report — Boiler B-01", type:"AI Analysis Report", date:"10 Jul 2026", status:"Pending Review" },
    { name:"Maintenance Report — Pump P-204", type:"Maintenance Report", date:"05 Jul 2026", status:"Completed" },
    { name:"Inspection Report — Conveyor C-08", type:"Inspection Report", date:"01 Jul 2026", status:"Completed" },
  ],

  notifications: [
    { level:"critical", title:"High Temperature — Compressor CP-17", desc:"Discharge temperature exceeded safe threshold (89°C).", time:"2 min ago", unread:true },
    { level:"warning", title:"High Vibration — Motor M-101", desc:"Vibration reading trending upward over last 6 hours.", time:"18 min ago", unread:true },
    { level:"info", title:"Sensor Offline — Boiler B-01", desc:"Vibration sensor lost connection briefly, now restored.", time:"1 hr ago", unread:false },
    { level:"warning", title:"Maintenance Due — Pump P-204", desc:"Scheduled maintenance window opens in 3 days.", time:"3 hr ago", unread:false },
    { level:"success", title:"Maintenance Completed — Conveyor C-08", desc:"Belt tension service completed by Arjun Singh.", time:"Yesterday", unread:false },
  ],

  timeline: [
    { time:"08:00 AM", text:"Maintenance Completed — Conveyor C-08", tone:"success" },
    { time:"09:15 AM", text:"Temperature Increased — Boiler B-01", tone:"warning" },
    { time:"11:40 AM", text:"Inspection Scheduled — Motor M-101", tone:"info" },
    { time:"01:20 PM", text:"Vibration Alert — Compressor CP-17", tone:"critical" },
  ],

  aiSuggestions: [
    "Show maintenance history",
    "Explain vibration issue",
    "Bearing replacement procedure",
    "Motor overheating",
  ],

  aiSeed: [
    { from:"bot", text:"Hi Rahul — I'm your industrial knowledge assistant. Ask me about any machine, SOP, or maintenance record." }
  ],
};

const TONE_COLOR = {
  success: "var(--color-success)", warning:"var(--color-warning)",
  danger: "var(--color-danger)", critical:"var(--color-danger)", info:"var(--color-primary)"
};

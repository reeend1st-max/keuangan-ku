/* ==========================================================================
   Keuangan Ku — Main React Application (Pure JS / UMD / React 18)
   ========================================================================== */

var useState = React.useState;
var useEffect = React.useEffect;
var useCallback = React.useCallback;

// ── Theme Design Tokens ───────────────────────────────────────────────────────
var T = {
  bg: "#0A0E17",
  surface: "#111726",
  card: "#161F33",
  panel: "#1C273E",
  border: "#243252",
  sidebar: "#0D1321",
  teal: "#00E5A3",
  tealDim: "rgba(0, 229, 163, 0.12)",
  sage: "#10B981",
  sageDim: "rgba(16, 185, 129, 0.12)",
  coral: "#FF5C7C",
  coralDim: "rgba(255, 92, 124, 0.12)",
  amber: "#F59E0B",
  amberDim: "rgba(245, 158, 11, 0.12)",
  sky: "#3B82F6",
  skyDim: "rgba(59, 130, 246, 0.12)",
  violet: "#8B5CF6",
  violetDim: "rgba(139, 92, 246, 0.12)",
  text: "#F3F4F6",
  textSub: "#9CA3AF",
  textDim: "#6B7280",
};

// ── Categories configuration ──────────────────────────────────────────────────
var CATS = {
  "Makan & Minum": { emoji: "🍔", color: T.amber },
  "Skincare": { emoji: "✨", color: T.violet },
  "Fashion": { emoji: "👕", color: "#EC4899" },
  "Tagihan": { emoji: "📄", color: T.coral },
  "Transportasi": { emoji: "🚗", color: T.sky },
  "Hiburan": { emoji: "🎬", color: "#6366F1" },
  "Darurat": { emoji: "🚨", color: "#EF4444" },
  "Tabungan": { emoji: "🏦", color: T.teal },
  "Lain-lain": { emoji: "📦", color: T.textSub },
};

function getCat(name) {
  return CATS[name] || { emoji: "📌", color: T.textSub };
}

// ── Helper Utilities ──────────────────────────────────────────────────────────
function fmt(num) {
  return "Rp " + new Intl.NumberFormat("id-ID").format(num || 0);
}

function fmtS(num) {
  var n = num || 0;
  if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + "jt";
  if (Math.abs(n) >= 1000) return (n / 1000).toFixed(0) + "rb";
  return String(n);
}

function mkKey(year, month) {
  return year + "-" + String(month).padStart(2, "0");
}

function parseD(str) {
  if (!str) return 0;
  var parts = str.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
  }
  return new Date(str).getTime();
}

function todayStr() {
  var d = new Date();
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Toast Hook ────────────────────────────────────────────────────────────────
function useToast() {
  var _t = useState(null),
    toast = _t[0],
    setToast = _t[1];
  var show = useCallback(function (msg, type) {
    setToast({ msg: msg, type: type || "info", id: uid() });
  }, []);
  var hide = useCallback(function () {
    setToast(null);
  }, []);
  return { toast: toast, show: show, hide: hide };
}

function Toast(p) {
  if (!p.toast) return null;
  var bg =
    p.toast.type === "error"
      ? T.coral
      : p.toast.type === "success"
      ? T.sage
      : T.sky;
  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        bottom: 24,
        right: 24,
        background: bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        fontWeight: 700,
        fontSize: 13,
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 10,
      },
    },
    React.createElement("span", null, p.toast.msg)
  );
}

// ── Reusable UI Components ────────────────────────────────────────────────────
function Chip(p) {
  var col = p.color || T.teal;
  return React.createElement(
    "span",
    {
      style: {
        background: col + "20",
        color: col,
        border: "1px solid " + col + "40",
        padding: "2px 8px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 700,
      },
    },
    p.label
  );
}

function Btn(p) {
  var bg = p.outline
    ? "transparent"
    : p.color || T.teal;
  var color = p.outline ? p.color || T.teal : "#0A0E17";
  var border = p.outline
    ? "1.5px solid " + (p.color || T.teal)
    : "none";
  return React.createElement(
    "button",
    {
      onClick: p.onClick,
      disabled: p.disabled,
      style: {
        background: bg,
        color: color,
        border: border,
        padding: p.small ? "6px 12px" : "9px 18px",
        borderRadius: 9,
        fontSize: p.small ? 12 : 13,
        fontWeight: 700,
        cursor: p.disabled ? "not-allowed" : "pointer",
        opacity: p.disabled ? 0.5 : 1,
        transition: "all .15s ease",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      },
    },
    p.children
  );
}

function DInput(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label &&
      React.createElement(
        "label",
        { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } },
        p.label
      ),
    React.createElement("input", {
      type: p.type || "text",
      value: p.value,
      onChange: function (e) {
        p.onChange(e.target.value);
      },
      placeholder: p.placeholder,
      autoFocus: p.autoFocus,
      style: {
        background: T.panel,
        border: "1.5px solid " + T.border,
        borderRadius: 9,
        padding: "9px 12px",
        color: T.text,
        fontSize: 13,
        outline: "none",
        fontFamily: "inherit",
      },
    })
  );
}

function DSelect(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label &&
      React.createElement(
        "label",
        { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } },
        p.label
      ),
    React.createElement(
      "select",
      {
        value: p.value,
        onChange: function (e) {
          p.onChange(e.target.value);
        },
        style: {
          background: T.panel,
          border: "1.5px solid " + T.border,
          borderRadius: 9,
          padding: "9px 12px",
          color: T.text,
          fontSize: 13,
          outline: "none",
          fontFamily: "inherit",
          cursor: "pointer",
        },
      },
      p.options.map(function (opt) {
        var val = typeof opt === "string" ? opt : opt.value;
        var lbl = typeof opt === "string" ? opt : opt.label;
        return React.createElement("option", { key: val, value: val }, lbl);
      })
    )
  );
}

function DToggle(p) {
  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", gap: 5 } },
    p.label &&
      React.createElement(
        "label",
        { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } },
        p.label
      ),
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          background: T.panel,
          borderRadius: 9,
          padding: 3,
          border: "1.5px solid " + T.border,
        },
      },
      p.options.map(function (opt, idx) {
        var active = p.value === opt;
        var activeColor = p.colors ? p.colors[idx] : T.teal;
        return React.createElement(
          "button",
          {
            key: opt,
            type: "button",
            onClick: function () {
              p.onChange(opt);
            },
            style: {
              flex: 1,
              padding: "7px 10px",
              borderRadius: 7,
              border: "none",
              background: active ? activeColor : "transparent",
              color: active ? "#0A0E17" : T.textSub,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all .12s ease",
            },
          },
          opt
        );
      })
    )
  );
}

function Modal(p) {
  if (!p.open) return null;
  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9000,
        padding: 16,
      },
    },
    React.createElement(
      "div",
      {
        style: {
          background: T.card,
          border: "1px solid " + T.border,
          borderRadius: 16,
          width: p.width || 440,
          maxWidth: "100%",
          padding: 24,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: "1px solid " + T.border,
          },
        },
        React.createElement("h3", { style: { margin: 0, fontSize: 16, fontWeight: 800, color: T.text } }, p.title),
        React.createElement(
          "button",
          {
            onClick: p.onClose,
            style: {
              background: "none",
              border: "none",
              color: T.textSub,
              fontSize: 18,
              cursor: "pointer",
            },
          },
          "✕"
        )
      ),
      p.children
    )
  );
}

function ConfirmModal(p) {
  if (!p.open) return null;
  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onCancel, title: "Konfirmasi Hapus", width: 380 },
    React.createElement("p", { style: { fontSize: 13, color: T.textSub, lineHeight: 1.6 } }, p.message),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onCancel }, "Batal"),
      React.createElement(Btn, { color: T.coral, onClick: p.onConfirm }, "Ya, Hapus")
    )
  );
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen(p) {
  var _m = useState("login"), mode = _m[0], setMode = _m[1];
  var _e = useState(""), email = _e[0], setEmail = _e[1];
  var _u = useState(""), username = _u[0], setUsername = _u[1];
  var _pw = useState(""), password = _pw[0], setPassword = _pw[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];

  function submit(e) {
    if (e) e.preventDefault();
    setErr("");
    setLoading(true);

    if (mode === "signup") {
      window.Api.register(email, username, password)
        .then(function (res) {
          setLoading(false);
          p.onAuth(res.user);
        })
        .catch(function (error) {
          setLoading(false);
          setErr(error.message);
        });
    } else {
      window.Api.login(username, password)
        .then(function (res) {
          setLoading(false);
          p.onAuth(res.user);
        })
        .catch(function (error) {
          setLoading(false);
          setErr(error.message);
        });
    }
  }

  var isUp = mode === "signup";

  return React.createElement(
    "div",
    {
      style: {
        background: T.bg,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          width: 400,
          maxWidth: "90vw",
          background: T.card,
          borderRadius: 20,
          padding: "36px 32px",
          border: "1px solid " + T.border,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        },
      },
      React.createElement(
        "div",
        { style: { textAlign: "center", marginBottom: 24 } },
        React.createElement("div", { style: { fontSize: 44, marginBottom: 8 } }, "💰"),
        React.createElement("h1", { style: { margin: 0, fontSize: 24, fontWeight: 900, color: T.teal } }, "Keuangan Ku"),
        React.createElement("p", { style: { margin: "4px 0 0", fontSize: 13, color: T.textSub } }, "Personal Finance Tracker")
      ),
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            background: T.panel,
            borderRadius: 10,
            padding: 3,
            marginBottom: 20,
            border: "1px solid " + T.border,
          },
        },
        React.createElement(
          "button",
          {
            onClick: function () { setMode("login"); setErr(""); },
            style: {
              flex: 1, padding: "8px", borderRadius: 8, border: "none",
              background: !isUp ? T.tealDim : "transparent",
              color: !isUp ? T.teal : T.textSub, fontSize: 13, fontWeight: 700, cursor: "pointer",
            },
          },
          "Masuk"
        ),
        React.createElement(
          "button",
          {
            onClick: function () { setMode("signup"); setErr(""); },
            style: {
              flex: 1, padding: "8px", borderRadius: 8, border: "none",
              background: isUp ? T.tealDim : "transparent",
              color: isUp ? T.teal : T.textSub, fontSize: 13, fontWeight: 700, cursor: "pointer",
            },
          },
          "Daftar"
        )
      ),
      React.createElement(
        "form",
        { onSubmit: submit, style: { display: "flex", flexDirection: "column", gap: 14 } },
        isUp &&
          React.createElement(DInput, {
            label: "Email",
            value: email,
            onChange: setEmail,
            placeholder: "contoh@gmail.com",
            type: "email",
            autoFocus: true,
          }),
        React.createElement(DInput, {
          label: isUp ? "Username" : "Email atau Username",
          value: username,
          onChange: setUsername,
          placeholder: isUp ? "Pilih username kamu" : "Masukkan Email atau Username",
          autoFocus: !isUp,
        }),
        React.createElement(DInput, {
          label: "Password",
          value: password,
          onChange: setPassword,
          type: "password",
          placeholder: "Minimal 6 karakter",
        }),
        err &&
          React.createElement(
            "div",
            {
              style: {
                background: T.coralDim, border: "1px solid " + T.coral + "30",
                color: T.coral, padding: "10px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              },
            },
            "⚠️ ", err
          ),
        React.createElement(
          "button",
          {
            type: "submit",
            disabled: loading,
            style: {
              marginTop: 6, background: "linear-gradient(135deg," + T.teal + ",#00b882)",
              color: "#0A0E17", border: "none", padding: 12, borderRadius: 10,
              fontSize: 14, fontWeight: 800, cursor: loading ? "wait" : "pointer",
            },
          },
          loading ? "Memproses..." : isUp ? "Buat Akun →" : "Masuk →"
        )
      )
    )
  );
}

// ── Onboarding Name Modal ─────────────────────────────────────────────────────
function NameOnboardingModal(p) {
  var _n = useState(""), name = _n[0], setName = _n[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];
  var _ld = useState(false), loading = _ld[0], setLoading = _ld[1];

  if (!p.open) return null;

  function submit() {
    if (!name.trim()) return setErr("Nama akun wajib diisi.");
    setLoading(true);
    window.Api.updateName(name)
      .then(function (res) {
        setLoading(false);
        p.onSave(res.user);
      })
      .catch(function (e) {
        setLoading(false);
        setErr(e.message);
      });
  }

  return React.createElement(
    Modal,
    { open: p.open, title: "🎉 Selamat Datang di KeuanganKu!", width: 420 },
    React.createElement("p", { style: { fontSize: 13, color: T.textSub, lineHeight: 1.6, marginBottom: 16 } },
      "Silakan isi nama akun Anda (misalnya Nama Lengkap Anda) untuk personalisasi dashboard."
    ),
    React.createElement(DInput, {
      label: "Nama Lengkap / Nama Akun",
      value: name,
      onChange: setName,
      placeholder: "Contoh: Rendi / Rendi Prasetyo",
      autoFocus: true,
    }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", marginTop: 20 } },
      React.createElement(Btn, { color: T.teal, onClick: submit, disabled: loading }, loading ? "Menyimpan..." : "Simpan & Lanjutkan →")
    )
  );
}

// ── Expense Form ──────────────────────────────────────────────────────────────
function ExpenseForm(p) {
  var _t = useState(todayStr()), tanggal = _t[0], setTanggal = _t[1];
  var _k = useState("Makan & Minum"), keperluan = _k[0], setKeperluan = _k[1];
  var _cat = useState("Makan & Minum"), kategori = _cat[0], setKategori = _cat[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _bay = useState("Transfer"), bayar = _bay[0], setBayar = _bay[1];
  var _nw = useState("Need"), nw = _nw[0], setNw = _nw[1];
  var _c = useState(""), catatan = _c[0], setCatatan = _c[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];

  useEffect(function () {
    if (p.initial) {
      setTanggal(p.initial.tanggal || todayStr());
      setKeperluan(p.initial.keperluan || "");
      setKategori(p.initial.kategori || "Makan & Minum");
      setNominal(String(p.initial.nominal || ""));
      setBayar(p.initial.bayar || "Transfer");
      setNw(p.initial.nw || "Need");
      setCatatan(p.initial.catatan || "");
    } else {
      setTanggal(todayStr()); setKeperluan(""); setKategori("Makan & Minum");
      setNominal(""); setBayar("Transfer"); setNw("Need"); setCatatan("");
    }
    setErr("");
  }, [p.initial, p.open]);

  if (!p.open) return null;

  function save() {
    setErr("");
    var nom = parseInt(nominal, 10);
    if (!keperluan.trim()) return setErr("Keperluan pengeluaran wajib diisi.");
    if (!nom || nom <= 0) return setErr("Nominal pengeluaran harus lebih dari 0.");
    if (!tanggal) return setErr("Tanggal wajib diisi.");

    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();

    var item = {
      id: p.initial ? p.initial.id : uid(),
      month_id: mkKey(y, m),
      year: y,
      month: m,
      tanggal: tanggal,
      keperluan: keperluan,
      kategori: kategori,
      nominal: nom,
      bayar: bayar,
      nw: nw,
      catatan: catatan,
    };
    p.onSave(item);
    p.onClose();
  }

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: p.initial ? "✏️ Edit Pengeluaran" : "➕ Tambah Pengeluaran", width: 500 },
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DInput, { label: "Tanggal (DD/MM/YYYY)", value: tanggal, onChange: setTanggal }),
      React.createElement(DInput, { label: "Nominal (Rp)", value: nominal, onChange: function (v) { setNominal(v.replace(/\D/g, "")); }, type: "number", placeholder: "0" })
    ),
    React.createElement("div", { style: { marginBottom: 14 } },
      React.createElement(DInput, { label: "Keperluan / Deskripsi", value: keperluan, onChange: setKeperluan, placeholder: "Contoh: Makan siang, Beli baju...", autoFocus: true })
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DSelect, { label: "Kategori", value: kategori, onChange: setKategori, options: Object.keys(CATS) }),
      React.createElement(DToggle, { label: "Kebutuhan / Keinginan", value: nw, onChange: setNw, options: ["Need", "Want"], colors: [T.sky, T.violet] })
    ),
    React.createElement("div", { style: { marginBottom: 14 } },
      React.createElement(DSelect, { label: "Metode Pembayaran", value: bayar, onChange: setBayar, options: ["Transfer", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] })
    ),
    React.createElement(DInput, { label: "Catatan Tambahan (opsional)", value: catatan, onChange: setCatatan, placeholder: "Keterangan tambahan..." }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid " + T.border } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
      React.createElement(Btn, { color: T.coral, onClick: save }, "💾 ", p.initial ? "Simpan Perubahan" : "Tambah Pengeluaran")
    )
  );
}

// ── Income Form ───────────────────────────────────────────────────────────────
function IncomeForm(p) {
  var _t = useState(todayStr()), tanggal = _t[0], setTanggal = _t[1];
  var _s = useState("Gajian"), sumber = _s[0], setSumber = _s[1];
  var _nom = useState(""), nominal = _nom[0], setNominal = _nom[1];
  var _m = useState("Transfer"), metode = _m[0], setMetode = _m[1];
  var _c = useState(""), catatan = _c[0], setCatatan = _c[1];
  var _err = useState(""), err = _err[0], setErr = _err[1];

  useEffect(function () {
    if (p.initial) {
      setTanggal(p.initial.tanggal || todayStr());
      setSumber(p.initial.sumber || "Gajian");
      setNominal(String(p.initial.nominal || ""));
      setMetode(p.initial.metode || "Transfer");
      setCatatan(p.initial.catatan || "");
    } else {
      setTanggal(todayStr()); setSumber("Gajian"); setNominal(""); setMetode("Transfer"); setCatatan("");
    }
    setErr("");
  }, [p.initial, p.open]);

  if (!p.open) return null;

  function save() {
    setErr("");
    var nom = parseInt(nominal, 10);
    if (!sumber.trim()) return setErr("Sumber pemasukan wajib diisi.");
    if (!nom || nom <= 0) return setErr("Nominal pemasukan harus lebih dari 0.");
    if (!tanggal) return setErr("Tanggal wajib diisi.");

    var parts = tanggal.split("/");
    var d = parseInt(parts[0]) || 1;
    var m = (parseInt(parts[1]) || 1) - 1;
    var y = parseInt(parts[2]) || new Date().getFullYear();

    var item = {
      id: p.initial ? p.initial.id : uid(),
      month_id: mkKey(y, m),
      year: y,
      month: m,
      tanggal: tanggal,
      sumber: sumber,
      nominal: nom,
      metode: metode,
      catatan: catatan,
    };
    p.onSave(item);
    p.onClose();
  }

  return React.createElement(
    Modal,
    { open: p.open, onClose: p.onClose, title: p.initial ? "✏️ Edit Pemasukan" : "💵 Tambah Pemasukan", width: 480 },
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DInput, { label: "Tanggal (DD/MM/YYYY)", value: tanggal, onChange: setTanggal }),
      React.createElement(DInput, { label: "Nominal (Rp)", value: nominal, onChange: function (v) { setNominal(v.replace(/\D/g, "")); }, type: "number", placeholder: "0" })
    ),
    React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 } },
      React.createElement(DInput, { label: "Sumber Pemasukan", value: sumber, onChange: setSumber, placeholder: "Gajian, Lemburan, Bonus...", autoFocus: true }),
      React.createElement(DSelect, { label: "Metode Penerimaan", value: metode, onChange: setMetode, options: ["Transfer", "E-Wallet", "Cash", "QRIS", "Debit", "Kredit"] })
    ),
    React.createElement(DInput, { label: "Catatan Tambahan (opsional)", value: catatan, onChange: setCatatan, placeholder: "Keterangan..." }),
    err && React.createElement("div", { style: { color: T.coral, fontSize: 12, marginTop: 10, fontWeight: 600 } }, "⚠️ ", err),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid " + T.border } },
      React.createElement(Btn, { outline: true, color: T.textSub, onClick: p.onClose }, "Batal"),
      React.createElement(Btn, { color: T.sage, onClick: save }, "💾 ", p.initial ? "Simpan Perubahan" : "Tambah Pemasukan")
    )
  );
}

// ── Tabungan View ─────────────────────────────────────────────────────────────
function TabunganView(p) {
  var setoran = p.savings.filter(function (s) { return s.tipe === "setoran"; });
  var penarikan = p.savings.filter(function (s) { return s.tipe === "penarikan"; });
  var tSetor = setoran.reduce(function (a, s) { return a + s.nominal; }, 0);
  var tTarik = penarikan.reduce(function (a, s) { return a + s.nominal; }, 0);
  var saldo = tSetor - tTarik;

  return React.createElement(
    "div",
    { style: { padding: "24px 32px", overflowY: "auto", height: "100%" } },
    React.createElement(
      "div",
      { style: { background: "linear-gradient(135deg,#06281e,#041812)", borderRadius: 18, padding: "24px 28px", border: "1px solid " + T.sage + "40", marginBottom: 20 } },
      React.createElement("div", { style: { fontSize: 11, color: T.sage, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 } }, "Total Saldo Tabungan Saat Ini"),
      React.createElement("div", { style: { fontSize: 36, fontWeight: 900, color: T.teal, marginTop: 4 } }, fmt(saldo)),
      React.createElement("div", { style: { display: "flex", gap: 20, marginTop: 12, fontSize: 12, color: T.textSub } },
        React.createElement("span", null, "💚 Total Ditabung: ", React.createElement("strong", { style: { color: T.sage } }, fmt(tSetor))),
        React.createElement("span", null, "🟡 Total Ditarik: ", React.createElement("strong", { style: { color: T.amber } }, fmt(tTarik)))
      )
    ),
    React.createElement(
      "div",
      { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, overflow: "hidden" } },
      React.createElement("div", { style: { padding: "16px 20px", borderBottom: "1px solid " + T.border, fontWeight: 700, fontSize: 15 } }, "📋 Riwayat Mutasi Tabungan"),
      p.savings.length === 0
        ? React.createElement("div", { style: { padding: 32, textAlign: "center", color: T.textSub } }, "Belum ada transaksi tabungan.")
        : p.savings.map(function (item) {
            var isStor = item.tipe === "setoran";
            return React.createElement(
              "div",
              { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid " + T.border } },
              React.createElement("div", null,
                React.createElement("div", { style: { fontSize: 13, fontWeight: 700, color: isStor ? T.sage : T.amber } }, isStor ? "💚 Setoran Tabungan" : "🟡 Penarikan Tabungan"),
                React.createElement("div", { style: { fontSize: 11, color: T.textSub, marginTop: 2 } }, item.tanggal, item.catatan ? " · " + item.catatan : "")
              ),
              React.createElement("div", { style: { fontSize: 15, fontWeight: 800, color: isStor ? T.sage : T.amber } }, (isStor ? "+" : "-") + fmt(item.nominal))
            );
          })
    )
  );
}

// ── Dashboard View ────────────────────────────────────────────────────────────
function DashboardView(p) {
  var tInc = p.income.reduce(function (s, i) { return s + i.nominal; }, 0);
  var tExp = p.expenses.reduce(function (s, e) { return s + e.nominal; }, 0);
  var saldo = tInc - tExp;

  var totalSetoran = p.savings.filter(function (s) { return s.tipe === "setoran"; }).reduce(function (a, s) { return a + s.nominal; }, 0);
  var totalPenarikan = p.savings.filter(function (s) { return s.tipe === "penarikan"; }).reduce(function (a, s) { return a + s.nominal; }, 0);
  var saldoTab = totalSetoran - totalPenarikan;

  var catMap = p.expenses.reduce(function (a, e) { a[e.kategori] = (a[e.kategori] || 0) + e.nominal; return a; }, {});
  var catArr = Object.entries(catMap).sort(function (a, b) { return b[1] - a[1]; });
  var need = p.expenses.filter(function (e) { return e.nw === "Need"; }).reduce(function (s, e) { return s + e.nominal; }, 0);
  var want = p.expenses.filter(function (e) { return e.nw === "Want"; }).reduce(function (s, e) { return s + e.nominal; }, 0);
  var recent = [].concat(p.expenses).sort(function (a, b) { return parseD(b.tanggal) - parseD(a.tanggal); }).slice(0, 6);

  function Card(cp) {
    return React.createElement(
      "div",
      { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, overflow: "hidden", display: "flex", flexDirection: "column" } },
      React.createElement(
        "div",
        { style: { padding: "14px 18px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", gap: 8 } },
        React.createElement("span", { style: { fontSize: 18 } }, cp.icon),
        React.createElement("span", { style: { fontSize: 14, fontWeight: 700, color: T.text } }, cp.title),
        cp.badge && React.createElement("span", { style: { marginLeft: "auto", fontSize: 11, fontWeight: 700, color: cp.badgeColor || T.textSub } }, cp.badge)
      ),
      React.createElement("div", { style: { padding: "16px 18px", flex: 1 } }, cp.children)
    );
  }

  return React.createElement(
    "div",
    { style: { padding: "22px 26px", overflowY: "auto", height: "100%" } },
    React.createElement(
      "div",
      { style: { background: "linear-gradient(135deg,#0B1F3A,#061020)", borderRadius: 18, padding: "22px 28px", border: "1px solid #1a3a6a", marginBottom: 18, position: "relative", overflow: "hidden" } },
      React.createElement("div", { style: { position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: T.teal + "0a" } }),
      React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 } }, "💰 Total Saldo Keuangan Saat Ini"),
      React.createElement("div", { style: { fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: saldo >= 0 ? T.teal : T.coral, marginBottom: 6 } }, (saldo < 0 ? "-" : "") + "Rp " + new Intl.NumberFormat("id-ID").format(Math.abs(saldo))),
      React.createElement(
        "div",
        { style: { fontSize: 12, color: T.textSub, display: "flex", gap: 24, marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a3a6a" } },
        React.createElement("span", null, "📥 Total Pemasukan: ", React.createElement("strong", { style: { color: T.sage } }, fmt(tInc))),
        React.createElement("span", null, "📤 Total Pengeluaran: ", React.createElement("strong", { style: { color: T.coral } }, fmt(tExp))),
        React.createElement("span", null, "🏦 Total Tabungan: ", React.createElement("strong", { style: { color: T.teal } }, fmt(saldoTab)))
      )
    ),
    React.createElement(
      "div",
      { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 } },
      React.createElement(
        Card,
        { icon: "💚", title: "Pemasukan", badge: p.income.length + " transaksi", badgeColor: T.sage },
        React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.sage, marginBottom: 12 } }, fmt(tInc)),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 5 } },
          p.income.length === 0
            ? React.createElement("div", { style: { fontSize: 12, color: T.textDim, fontStyle: "italic" } }, "Belum ada pemasukan")
            : [].concat(p.income).sort(function (a, b) { return parseD(b.tanggal) - parseD(a.tanggal); }).slice(0, 5).map(function (item) {
                return React.createElement(
                  "div",
                  { key: item.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 8, background: T.panel, gap: 6 } },
                  React.createElement("div", { style: { minWidth: 0, flex: 1 } },
                    React.createElement("div", { style: { fontSize: 12, fontWeight: 600, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" } }, item.sumber),
                    React.createElement("div", { style: { fontSize: 10, color: T.textSub } }, item.tanggal)
                  ),
                  React.createElement("div", { style: { fontSize: 12, fontWeight: 800, color: T.sage, whiteSpace: "nowrap" } }, "+" + fmtS(item.nominal))
                );
              })
        )
      ),
      React.createElement(
        Card,
        { icon: "🔴", title: "Pengeluaran", badge: p.expenses.length + " transaksi", badgeColor: T.coral },
        React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: T.coral, marginBottom: 12 } }, fmt(tExp)),
        catArr.length === 0
          ? React.createElement("div", { style: { fontSize: 12, color: T.textDim, fontStyle: "italic" } }, "Belum ada pengeluaran")
          : React.createElement(
              "div",
              { style: { display: "flex", flexDirection: "column", gap: 7 } },
              catArr.slice(0, 5).map(function (kv) {
                var cat = kv[0], amt = kv[1];
                var cfg = getCat(cat);
                var p2 = tExp > 0 ? (amt / tExp) * 100 : 0;
                return React.createElement(
                  "div",
                  { key: cat, style: { display: "flex", alignItems: "center", gap: 8 } },
                  React.createElement("span", { style: { fontSize: 14 } }, cfg.emoji),
                  React.createElement(
                    "div",
                    { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 3 } },
                      React.createElement("span", { style: { fontSize: 11, color: T.text, fontWeight: 600 } }, cat),
                      React.createElement("span", { style: { fontSize: 11, color: T.coral, fontWeight: 700 } }, fmtS(amt))
                    ),
                    React.createElement("div", { style: { height: 4, background: T.border, borderRadius: 2 } },
                      React.createElement("div", { style: { height: "100%", width: p2 + "%", background: cfg.color, borderRadius: 2 } })
                    )
                  )
                );
              }),
              React.createElement(
                "div",
                { style: { paddingTop: 8, borderTop: "1px solid " + T.border, display: "flex", gap: 6, marginTop: 2 } },
                React.createElement("div", { style: { flex: 1, background: T.skyDim, borderRadius: 8, padding: "7px 10px", border: "1px solid " + T.sky + "30" } },
                  React.createElement("div", { style: { fontSize: 9, color: T.sky, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "🔵 Need"),
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, fmtS(need))
                ),
                React.createElement("div", { style: { flex: 1, background: T.violetDim, borderRadius: 8, padding: "7px 10px", border: "1px solid " + T.violet + "30" } },
                  React.createElement("div", { style: { fontSize: 9, color: T.violet, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 } }, "💜 Want"),
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, fmtS(want))
                )
              )
            )
      ),
      React.createElement(
        Card,
        { icon: "🏦", title: "Tabungan", badge: "Saldo " + fmt(saldoTab), badgeColor: saldoTab >= 0 ? T.teal : T.coral },
        React.createElement("div", { style: { fontSize: 26, fontWeight: 900, color: saldoTab >= 0 ? T.teal : T.coral, marginBottom: 12 } }, fmt(saldoTab)),
        React.createElement(
          "div",
          { style: { display: "flex", flexDirection: "column", gap: 8 } },
          React.createElement(
            "div",
            { style: { display: "flex", gap: 6 } },
            React.createElement("div", { style: { flex: 1, background: T.sageDim, borderRadius: 8, padding: "8px 10px", border: "1px solid " + T.sage + "30" } },
              React.createElement("div", { style: { fontSize: 9, color: T.sage, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, "💚 Ditabung"),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, fmtS(totalSetoran))
            ),
            React.createElement("div", { style: { flex: 1, background: T.amberDim, borderRadius: 8, padding: "8px 10px", border: "1px solid " + T.amber + "30" } },
              React.createElement("div", { style: { fontSize: 9, color: T.amber, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 } }, "🟡 Ditarik"),
              React.createElement("div", { style: { fontSize: 13, fontWeight: 800, color: T.text } }, fmtS(totalPenarikan))
            )
          )
        )
      )
    ),
    React.createElement(
      "div",
      { style: { background: T.card, borderRadius: 16, border: "1px solid " + T.border, overflow: "hidden" } },
      React.createElement("div", { style: { padding: "14px 18px", borderBottom: "1px solid " + T.border, fontSize: 14, fontWeight: 700 } }, "📋 Pengeluaran Terakhir"),
      React.createElement(
        "div",
        { style: { overflowY: "auto", maxHeight: 300 } },
        recent.length === 0
          ? React.createElement("div", { style: { textAlign: "center", padding: 28, color: T.textSub, fontSize: 13 } }, "Belum ada pengeluaran")
          : recent.map(function (e) {
              var cfg = getCat(e.kategori);
              return React.createElement(
                "div",
                { key: e.id, style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: "1px solid " + T.border } },
                React.createElement("span", { style: { fontSize: 15 } }, cfg.emoji),
                React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                  React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: T.text } }, e.keperluan),
                  React.createElement("div", { style: { fontSize: 11, color: T.textSub } }, e.tanggal + " · " + e.kategori)
                ),
                React.createElement(Chip, { label: e.nw, color: e.nw === "Need" ? T.sky : T.violet }),
                React.createElement("span", { style: { fontSize: 13, fontWeight: 700, color: T.coral } }, "-" + fmtS(e.nominal))
              );
            })
      )
    )
  );
}

// ── Pemasukan View ────────────────────────────────────────────────────────────
function PemasukanView(p) {
  var rows = [].concat(p.income).sort(function (a, b) { return parseD(b.tanggal) - parseD(a.tanggal); });
  var total = rows.reduce(function (s, i) { return s + i.nominal; }, 0);
  var mc = { Transfer: T.teal, "E-Wallet": T.violet, Cash: T.amber, QRIS: T.sky, Debit: T.sage, Kredit: T.coral };

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" } },
    React.createElement(
      "div",
      { style: { padding: "24px 32px 20px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 } },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 } }, "Pemasukan Utama"),
        React.createElement("div", { style: { fontSize: 28, fontWeight: 900, color: T.sage, marginTop: 4 } }, fmt(total)),
        React.createElement("div", { style: { fontSize: 13, color: T.textSub, marginTop: 4 } }, rows.length + " total transaksi")
      ),
      React.createElement(Btn, { color: T.sage, onClick: p.onAdd }, "💵 + Tambah Pemasukan")
    ),
    rows.length === 0
      ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: T.textSub, gap: 10 } }, React.createElement("div", { style: { fontSize: 48 } }, "💵"), React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: T.text } }, "Belum ada pemasukan"))
      : React.createElement(
          "div",
          { style: { flex: 1, overflowY: "auto" } },
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "130px 1fr 140px 180px 60px", padding: "10px 32px", background: T.surface, borderBottom: "1px solid " + T.border, position: "sticky", top: 0, zIndex: 10 } },
            ["Tanggal", "Sumber", "Metode", "Nominal", ""].map(function (h) { return React.createElement("div", { key: h, style: { fontSize: 11, fontWeight: 700, color: T.textSub, textTransform: "uppercase" } }, h); })
          ),
          rows.map(function (item, i) {
            return React.createElement(
              "div",
              { key: item.id, style: { display: "grid", gridTemplateColumns: "130px 1fr 140px 180px 60px", padding: "13px 32px", alignItems: "center", borderBottom: "1px solid " + T.border, background: i % 2 === 0 ? "transparent" : T.panel } },
              React.createElement("div", { style: { fontSize: 12, color: T.textSub, fontFamily: "monospace" } }, item.tanggal),
              React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: T.text } }, item.sumber), item.catatan && React.createElement("div", { style: { fontSize: 11, color: T.textDim } }, item.catatan)),
              React.createElement(Chip, { label: item.metode, color: mc[item.metode] || T.textSub }),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: T.sage } }, "+" + fmt(item.nominal)),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                React.createElement("button", { onClick: function () { p.onEdit(item); }, style: { background: T.card, border: "1px solid " + T.border, color: T.textSub, width: 28, height: 28, borderRadius: 6, cursor: "pointer" } }, "✏"),
                React.createElement("button", { onClick: function () { p.onDelete(item.id); }, style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, width: 28, height: 28, borderRadius: 6, cursor: "pointer" } }, "✕")
              )
            );
          })
        )
  );
}

// ── Pengeluaran View ──────────────────────────────────────────────────────────
function PengeluaranView(p) {
  var _fc = useState("Semua"), fCat = _fc[0], sFCat = _fc[1];
  var _fn = useState("Semua"), fNW = _fn[0], sFNW = _fn[1];
  var _fs = useState(""), search = _fs[0], sSearch = _fs[1];

  var all = p.expenses;
  var total = all.reduce(function (s, e) { return s + e.nominal; }, 0);
  var usedCats = [].concat([], all.map(function (e) { return e.kategori; })).filter(function (v, i, a) { return a.indexOf(v) === i; });
  var rows = [].concat(all).filter(function (e) {
    if (fCat !== "Semua" && e.kategori !== fCat) return false;
    if (fNW !== "Semua" && e.nw !== fNW) return false;
    if (search && e.keperluan.toLowerCase().indexOf(search.toLowerCase()) < 0) return false;
    return true;
  }).sort(function (a, b) { return parseD(b.tanggal) - parseD(a.tanggal); });

  function pill(label, active, col, fn) {
    return React.createElement("button", { key: label, onClick: fn, style: { padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: "1.5px solid " + (active ? col : T.border), background: active ? col + "22" : "transparent", color: active ? col : T.textSub, cursor: "pointer", whiteSpace: "nowrap" } }, label);
  }

  return React.createElement(
    "div",
    { style: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" } },
    React.createElement(
      "div",
      { style: { padding: "24px 32px 16px", borderBottom: "1px solid " + T.border, flexShrink: 0 } },
      React.createElement(
        "div",
        { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 } },
        React.createElement("div", null, React.createElement("div", { style: { fontSize: 11, color: T.textSub, fontWeight: 700, textTransform: "uppercase" } }, "Pengeluaran Utama"), React.createElement("div", { style: { fontSize: 28, fontWeight: 900, color: T.coral, marginTop: 4 } }, fmt(total)), React.createElement("div", { style: { fontSize: 13, color: T.textSub, marginTop: 4 } }, all.length + " total transaksi")),
        React.createElement(Btn, { color: T.coral, onClick: p.onAdd }, "➕ Tambah Pengeluaran")
      ),
      React.createElement(
        "div",
        { style: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" } },
        React.createElement("input", { value: search, onChange: function (e) { sSearch(e.target.value); }, placeholder: "🔍 Cari...", style: { background: T.panel, border: "1.5px solid " + T.border, borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", width: 200 } }),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 6, flexWrap: "wrap" } },
          ["Semua"].concat(usedCats).map(function (c) { var cfg = getCat(c); return pill(c === "Semua" ? "Semua" : cfg.emoji + " " + c, fCat === c, cfg.color || T.teal, function () { sFCat(c); }); })
        ),
        React.createElement(
          "div",
          { style: { display: "flex", gap: 6 } },
          ["Semua", "Need", "Want"].map(function (n) { return pill(n === "Need" ? "🔵 Need" : n === "Want" ? "💜 Want" : "Semua", fNW === n, n === "Need" ? T.sky : n === "Want" ? T.violet : T.textSub, function () { sFNW(n); }); })
        )
      )
    ),
    rows.length === 0
      ? React.createElement("div", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, color: T.textSub, gap: 10 } }, React.createElement("div", { style: { fontSize: 48 } }, "💸"), React.createElement("div", { style: { fontSize: 15, fontWeight: 700, color: T.text } }, "Belum ada pengeluaran"))
      : React.createElement(
          "div",
          { style: { flex: 1, overflowY: "auto" } },
          React.createElement(
            "div",
            { style: { display: "grid", gridTemplateColumns: "120px 1fr 150px 100px 160px 80px 60px", padding: "10px 32px", background: T.surface, borderBottom: "1px solid " + T.border, position: "sticky", top: 0, zIndex: 10 } },
            ["Tanggal", "Keperluan", "Kategori", "NW", "Nominal", "Bayar", ""].map(function (h) { return React.createElement("div", { key: h, style: { fontSize: 11, fontWeight: 700, color: T.textSub, textTransform: "uppercase" } }, h); })
          ),
          rows.map(function (item, i) {
            var cfg = getCat(item.kategori);
            return React.createElement(
              "div",
              { key: item.id, style: { display: "grid", gridTemplateColumns: "120px 1fr 150px 100px 160px 80px 60px", padding: "12px 32px", alignItems: "center", borderBottom: "1px solid " + T.border, background: i % 2 === 0 ? "transparent" : T.panel } },
              React.createElement("div", { style: { fontSize: 12, color: T.textSub, fontFamily: "monospace" } }, item.tanggal),
              React.createElement("div", null, React.createElement("div", { style: { fontSize: 13, fontWeight: 600, color: T.text } }, item.keperluan), item.catatan && React.createElement("div", { style: { fontSize: 11, color: T.textDim } }, item.catatan)),
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, React.createElement("span", null, cfg.emoji), React.createElement("span", { style: { fontSize: 12, color: T.text } }, item.kategori)),
              React.createElement(Chip, { label: item.nw, color: item.nw === "Need" ? T.sky : T.violet }),
              React.createElement("div", { style: { fontSize: 14, fontWeight: 800, color: T.coral } }, "-" + fmt(item.nominal)),
              React.createElement(Chip, { label: item.bayar, color: T.textSub }),
              React.createElement(
                "div",
                { style: { display: "flex", gap: 4 } },
                React.createElement("button", { onClick: function () { p.onEdit(item); }, style: { background: T.card, border: "1px solid " + T.border, color: T.textSub, width: 28, height: 28, borderRadius: 6, cursor: "pointer" } }, "✏"),
                React.createElement("button", { onClick: function () { p.onDelete(item.id); }, style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, width: 28, height: 28, borderRadius: 6, cursor: "pointer" } }, "✕")
              )
            );
          })
        )
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar(p) {
  var nav = [
    { id: "dashboard", icon: "📊", label: "Ringkasan" },
    { id: "pemasukan", icon: "📥", label: "Pemasukan" },
    { id: "pengeluaran", icon: "📤", label: "Pengeluaran" },
    { id: "tabungan", icon: "🏦", label: "Tabungan" },
  ];
  return React.createElement(
    "div",
    { style: { width: 224, background: T.sidebar, borderRight: "1px solid " + T.border, display: "flex", flexDirection: "column", flexShrink: 0, userSelect: "none" } },
    React.createElement(
      "div",
      { style: { padding: "20px 18px 16px", borderBottom: "1px solid " + T.border } },
      React.createElement("div", { style: { fontSize: 20, fontWeight: 900, color: T.teal, letterSpacing: -0.5 } }, "💰 Keuangan"),
      React.createElement("div", { style: { fontSize: 10, color: T.textSub, marginTop: 3, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" } }, "Personal Finance")
    ),
    React.createElement(
      "div",
      { style: { padding: "10px 8px 6px", flex: 1, overflowY: "auto" } },
      React.createElement("div", { style: { fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", padding: "0 8px", marginBottom: 6 } }, "Menu Utama"),
      nav.map(function (item) {
        var active = p.view === item.id;
        return React.createElement(
          "button",
          {
            key: item.id,
            onClick: function () { p.onView(item.id); },
            style: {
              width: "100%", padding: "10px 12px", borderRadius: 10, marginBottom: 3, border: "none",
              background: active ? T.tealDim : "transparent",
              color: active ? T.teal : T.textSub, fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10, textAlign: "left",
              borderLeft: active ? "3px solid " + T.teal : "3px solid transparent",
            },
          },
          React.createElement("span", { style: { fontSize: 16 } }, item.icon), item.label
        );
      })
    ),
    React.createElement(
      "div",
      { style: { padding: "12px 14px", borderTop: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between" } },
      React.createElement("div", null, React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: T.text } }, p.user.name), React.createElement("div", { style: { fontSize: 10, color: T.textDim } }, "@" + (p.user.username || "user"))),
      React.createElement("button", { onClick: p.onLogout, title: "Logout", style: { background: T.coralDim, border: "1px solid " + T.coral + "30", color: T.coral, width: 28, height: 28, borderRadius: 7, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" } }, "⏏")
    )
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
function App() {
  var _u = useState(null), user = _u[0], setUser = _u[1];
  var _cs = useState(true), checkingSession = _cs[0], setCheckingSession = _cs[1];
  var _ld = useState(true), loading = _ld[0], setLoading = _ld[1];
  var _ex = useState([]), expenses = _ex[0], setExpenses = _ex[1];
  var _inc = useState([]), income = _inc[0], setIncome = _inc[1];
  var _sa = useState([]), savings = _sa[0], setSavings = _sa[1];
  var _vw = useState("dashboard"), view = _vw[0], setView = _vw[1];
  var _sef = useState(false), showExpForm = _sef[0], setSEF = _sef[1];
  var _sif = useState(false), showIncForm = _sif[0], setSIF = _sif[1];
  var _eex = useState(null), editingExp = _eex[0], setEditExp = _eex[1];
  var _ein = useState(null), editingInc = _ein[0], setEditInc = _ein[1];
  var _dt = useState(null), deleteTarget = _dt[0], setDT = _dt[1];
  var tk = useToast();

  useEffect(function () {
    window.Api.getSession().then(function (u) {
      if (u) setUser(u);
      setCheckingSession(false);
    }).catch(function () {
      setCheckingSession(false);
    });
  }, []);

  useEffect(function () {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    window.Api.fetchAll().then(function (data) {
      setExpenses(data.expenses || []);
      setIncome(data.income || []);
      setSavings(data.savings || []);
      setLoading(false);
    }).catch(function (e) {
      tk.show(e.message || "Gagal memuat data.", "error");
      setLoading(false);
    });
  }, [user]);

  var handleAuth = useCallback(function (u) { setUser(u); }, []);
  var handleLogout = useCallback(function () {
    window.Api.logout().finally(function () {
      setUser(null); setExpenses([]); setIncome([]); setSavings([]); setView("dashboard");
    });
  }, []);

  var saveExpense = useCallback(function (item) {
    window.Api.saveExpense(item).then(function (saved) {
      setExpenses(function (p) { return p.some(function (e) { return e.id === saved.id; }) ? p.map(function (e) { return e.id === saved.id ? saved : e; }) : [].concat(p, [saved]); });
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan pengeluaran.", "error"); });
    setEditExp(null);
  }, []);

  var saveIncome = useCallback(function (item) {
    window.Api.saveIncome(item).then(function (saved) {
      setIncome(function (p) { return p.some(function (i) { return i.id === saved.id; }) ? p.map(function (i) { return i.id === saved.id ? saved : i; }) : [].concat(p, [saved]); });
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan pemasukan.", "error"); });
    setEditInc(null);
  }, []);

  var saveSaving = useCallback(function (item) {
    window.Api.saveSaving(item).then(function (saved) {
      setSavings(function (p) { return p.some(function (s) { return s.id === saved.id; }) ? p.map(function (s) { return s.id === saved.id ? saved : s; }) : [].concat(p, [saved]); });
    }).catch(function (e) { tk.show(e.message || "Gagal menyimpan tabungan.", "error"); });
  }, []);

  var deleteSaving = useCallback(function (id) {
    window.Api.deleteSaving(id).then(function () {
      setSavings(function (p) { return p.filter(function (s) { return s.id !== id; }); });
    }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
  }, []);

  var confirmDelete = function () {
    if (!deleteTarget) return;
    var id = deleteTarget.id, type = deleteTarget.type;
    setDT(null);
    if (type === "expense") {
      window.Api.deleteExpense(id).then(function () {
        setExpenses(function (p) { return p.filter(function (e) { return e.id !== id; }); });
        tk.show("Transaksi dihapus", "info");
      }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
    } else {
      window.Api.deleteIncome(id).then(function () {
        setIncome(function (p) { return p.filter(function (i) { return i.id !== id; }); });
        tk.show("Transaksi dihapus", "info");
      }).catch(function (e) { tk.show(e.message || "Gagal menghapus.", "error"); });
    }
  };

  if (checkingSession) return React.createElement("div", { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } }, React.createElement("div", { style: { fontSize: 44 } }, "💰"), React.createElement("div", { style: { fontSize: 16, color: T.textSub, fontWeight: 600 } }, "Memeriksa sesi..."));
  if (!user) return React.createElement(AuthScreen, { onAuth: handleAuth });
  if (loading) return React.createElement("div", { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" } }, React.createElement("div", { style: { fontSize: 44 } }, "💰"), React.createElement("div", { style: { fontSize: 16, color: T.textSub, fontWeight: 600 } }, "Memuat data..."));

  var toolbarLabel =
    view === "dashboard" ? "📊 Ringkasan Keuangan Utama" :
    view === "pemasukan" ? "📥 Transaksi Pemasukan" :
    view === "pengeluaran" ? "📤 Transaksi Pengeluaran" :
    "🏦 Ringkasan Tabungan — setoran & penarikan";

  return React.createElement(
    "div",
    { style: { background: T.bg, width: "100vw", height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", color: T.text } },
    React.createElement(
      "div",
      { style: { height: 40, background: T.sidebar, borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 } },
      React.createElement("div", { style: { fontSize: 12, color: T.textSub, fontWeight: 600 } }, "💰 Keuangan Ku — Personal Finance Tracker"),
      React.createElement("div", { style: { fontSize: 11, color: T.textDim } }, new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" }))
    ),
    React.createElement(
      "div",
      { style: { flex: 1, display: "flex", overflow: "hidden" } },
      React.createElement(Sidebar, { view: view, onView: setView, user: user, onLogout: handleLogout }),
      React.createElement(
        "div",
        { style: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" } },
        React.createElement(
          "div",
          { style: { padding: "10px 24px", borderBottom: "1px solid " + T.border, display: "flex", alignItems: "center", justifyContent: "space-between", background: T.surface, flexShrink: 0 } },
          React.createElement("div", { style: { fontSize: 13, color: T.textSub, fontWeight: 600 } }, toolbarLabel),
          React.createElement(
            "div",
            { style: { display: "flex", gap: 8 } },
            view === "pengeluaran" && React.createElement(Btn, { color: T.coral, onClick: function () { setEditExp(null); setSEF(true); } }, "➕ Tambah Pengeluaran"),
            view === "pemasukan" && React.createElement(Btn, { color: T.sage, onClick: function () { setEditInc(null); setSIF(true); } }, "💵 Tambah Pemasukan"),
            view === "dashboard" && React.createElement(
              React.Fragment,
              null,
              React.createElement(Btn, { color: T.sage, outline: true, onClick: function () { setEditInc(null); setSIF(true); } }, "💵 + Pemasukan"),
              React.createElement(Btn, { color: T.coral, onClick: function () { setEditExp(null); setSEF(true); } }, "➕ + Pengeluaran")
            )
          )
        ),
        React.createElement(
          "div",
          { style: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" } },
          view === "dashboard" && React.createElement(DashboardView, { expenses: expenses, income: income, savings: savings }),
          view === "pemasukan" && React.createElement(PemasukanView, { income: income, onAdd: function () { setEditInc(null); setSIF(true); }, onEdit: function (item) { setEditInc(item); setSIF(true); }, onDelete: function (id) { setDT({ type: "income", id: id }); } }),
          view === "pengeluaran" && React.createElement(PengeluaranView, { expenses: expenses, onAdd: function () { setEditExp(null); setSEF(true); }, onEdit: function (item) { setEditExp(item); setSEF(true); }, onDelete: function (id) { setDT({ type: "expense", id: id }); } }),
          view === "tabungan" && React.createElement(TabunganView, { savings: savings, onSave: saveSaving, onDelete: deleteSaving })
        )
      )
    ),
    React.createElement(ExpenseForm, { open: showExpForm, onClose: function () { setSEF(false); setEditExp(null); }, onSave: saveExpense, initial: editingExp, showToast: tk.show }),
    React.createElement(IncomeForm, { open: showIncForm, onClose: function () { setSIF(false); setEditInc(null); }, onSave: saveIncome, initial: editingInc, showToast: tk.show }),
    React.createElement(ConfirmModal, { open: !!deleteTarget, message: "Yakin ingin menghapus transaksi ini? Data tidak bisa dikembalikan.", onConfirm: confirmDelete, onCancel: function () { setDT(null); } }),
    React.createElement(NameOnboardingModal, { open: user && (!user.name || !user.name.trim()), onSave: function (u) { setUser(u); tk.show("Nama akun berhasil disimpan!"); } }),
    React.createElement(Toast, { toast: tk.toast })
  );
}

// Render root
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));

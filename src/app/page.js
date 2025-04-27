"use client";

import { useState, useEffect } from "react";
import { pdf } from "@react-pdf/renderer";
import InvoicePDF from "@/components/InvoicePDF";

export default function Home() {
  const [data, setData] = useState({
    nomor_nota: "",
    tanggal: "",
    tanggal_jatuh_tempo: "",
    items: [{ id: 1, date: "", quantity: "" }],
    satuan: "",
    rekening: {
      nomor_rekening: "",
      bank: "",
      nama_rekening: ""
    },
    penanda_tangan: "",
  });

  const [invoiceOrder, setInvoiceOrder] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Check if it's client-side to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data from localStorage only on the client
  useEffect(() => {
    if (isClient) {
      const savedData = localStorage.getItem("invoice_data");
      const savedOrder = localStorage.getItem("invoice_order");
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      if (savedOrder) {
        setInvoiceOrder(savedOrder);
      }
    }
  }, [isClient]);

  // Simpan ke localStorage setiap kali `data` berubah
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("invoice_data", JSON.stringify(data));
    }
  }, [data, isClient]);

  // Simpan ke localStorage setiap kali `invoiceOrder` berubah
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("invoice_order", invoiceOrder);
    }
  }, [invoiceOrder, isClient]);

  const formatInvoiceNumber = (order, tanggal) => {
    if (!tanggal || !order) return "";
    const date = new Date(tanggal);
    const bulan = String(date.getMonth() + 1).padStart(2, "0");
    const tahun = date.getFullYear();
    return `${order}/RMRY/${bulan}/${tahun}`;
  };

  const handleAddItem = () => {
    setData((prev) => ({
      ...prev,
      items: [...prev.items, { id: prev.items.length + 1, date: "", quantity: "" }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (data.items.length <= 1) {
      alert("Minimal harus ada satu item.");
      return;
    }
    const updatedItems = [...data.items];
    updatedItems.splice(index, 1);
    setData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleChange = (field, value) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...data.items];
    updatedItems[index][field] = value;
    setData((prev) => ({ ...prev, items: updatedItems }));
  };

  const handleSubmit = () => {
    if (!invoiceOrder || !data.tanggal || !data.tanggal_jatuh_tempo || !data.satuan) {
      alert("Harap isi semua field utama (Nota ke-, Tanggal, Harga Satuan, dan Tanggal Jatuh Tempo).");
      return;
    }

    for (const item of data.items) {
      if (!item.date || !item.quantity) {
        alert("Harap isi semua tanggal dan jumlah pada setiap item.");
        return;
      }
    }

    if (!data.rekening.nomor_rekening || !data.rekening.bank || !data.rekening.nama_rekening) {
      alert("Harap lengkapi semua data rekening (Nomor Rekening, Nama Bank, Nama Rekening).");
      return;
    }

    if (!data.penanda_tangan) {
      alert("Harap isi nama penanda tangan.");
      return;
    }

    if (!data.nomor_nota) {
      alert("Nomor nota belum terbentuk. Periksa input 'Nota ke-' dan 'Tanggal'.");
      return;
    }

    const element = (
      <InvoicePDF
        data={data}
        totalHarga={totalHarga}
        terbilangText={terbilang(totalHarga)}
      />
    );

    const blob = pdf(element).toBlob();
    blob.then((b) => {
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice_${data.nomor_nota}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Hapus localStorage setelah submit berhasil
      localStorage.removeItem("invoice_data");
      localStorage.removeItem("invoice_order");
    });
  };

  const totalJumlah = data.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
  const totalHarga = totalJumlah * Number(data.satuan);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold">Invoice Generator</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <form className="flex flex-col gap-6">
          {/* Input Form */}
          <div className="flex gap-2 mb-4">
            <label className="w-1/3">Nota ke-</label>
            <input
              type="tel"
              className="input border rounded border-gray-300 flex-1"
              value={invoiceOrder}
              onChange={(e) => {
                const val = e.target.value;
                setInvoiceOrder(val);
                if (data.tanggal) {
                  handleChange("nomor_nota", formatInvoiceNumber(val, data.tanggal));
                }
              }}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <label className="w-1/3">Tanggal</label>
            <input
              type="date"
              className="input border rounded border-gray-300 flex-1"
              value={data.tanggal}
              onChange={(e) => {
                const tgl = e.target.value;
                handleChange("tanggal", tgl);
                if (invoiceOrder) {
                  handleChange("nomor_nota", formatInvoiceNumber(invoiceOrder, tgl));
                }
              }}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <label className="w-1/3">Tanggal Jatuh Tempo</label>
            <input
              type="date"
              className="input border rounded border-gray-300 flex-1"
              value={data.tanggal_jatuh_tempo}
              onChange={(e) => handleChange("tanggal_jatuh_tempo", e.target.value)}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <label className="w-1/3">Harga Satuan</label>
            <input
              type="tel"
              className="input border rounded border-gray-300 flex-1"
              value={data.satuan}
              onChange={(e) => handleChange("satuan", e.target.value)}
            />
          </div>

          <div className="flex gap-2 mb-4">
            <label className="w-1/3">Nama Penanda Tangan</label>
            <input
              type="text"
              className="input border rounded border-gray-300 flex-1"
              value={data.penanda_tangan}
              onChange={(e) => handleChange("penanda_tangan", e.target.value)}
              placeholder="Contoh: JOHN DOE"
            />
          </div>

          {/* Rekening Info */}
          <div className="flex flex-col gap-2 mb-4">
            <label className="font-bold">Informasi Rekening</label>

            <div className="flex gap-2">
              <label className="w-1/3">Nomor Rekening</label>
              <input
                type="tel"
                className="input border rounded border-gray-300 flex-1"
                value={data.rekening.nomor_rekening}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    rekening: { ...prev.rekening, nomor_rekening: e.target.value },
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <label className="w-1/3">Nama Bank</label>
              <input
                type="text"
                className="input border rounded border-gray-300 flex-1"
                value={data.rekening.bank}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    rekening: { ...prev.rekening, bank: e.target.value },
                  }))
                }
              />
            </div>

            <div className="flex gap-2">
              <label className="w-1/3">Nama Rekening</label>
              <input
                type="text"
                className="input border rounded border-gray-300 flex-1"
                value={data.rekening.nama_rekening}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    rekening: { ...prev.rekening, nama_rekening: e.target.value },
                  }))
                }
              />
            </div>
          </div>

          {/* Item List */}
          {data.items.map((item, index) => (
            <div key={item.id} className="border p-4 rounded relative mb-4 bg-gray-50">
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 font-bold text-xl cursor-pointer"
                title="Hapus item"
              >
                &times;
              </button>
              <label className="block font-medium mb-1">Item ke-{index + 1}</label>

              <div className="flex flex-col gap-2">
                <div>
                  <label className="block text-sm mb-1">Tanggal</label>
                  <input
                    type="date"
                    className="input border rounded border-gray-300 w-full"
                    value={item.date}
                    onChange={(e) => handleItemChange(index, "date", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Jumlah</label>
                  <input
                    type="tel"
                    className="input border rounded border-gray-300 w-full"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    placeholder="Masukkan jumlah"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddItem}
            className="btn btn-neutral rounded mt-2 w-full bg-blue-600 text-white"
          >
            Tambah Item
          </button>
        </form>
      </div>

      <div className="p-4">
        <button
          onClick={handleSubmit}
          className="btn btn-neutral rounded w-full bg-amber-500"
        >
          Submit dan Download Invoice
        </button>
      </div>
    </div>
  );
}

// Fungsi bantu: Ubah angka ke teks bahasa Indonesia
function terbilang(n) {
  const angka = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan"];
  const satuan = ["", " Ribu", " Juta", " Miliar"];

  if (n === 0) return "Nol";

  let result = "";
  let i = 0;

  while (n > 0) {
    let temp = "";
    let num = n % 1000;

    const ratus = Math.floor(num / 100);
    const puluh = Math.floor((num % 100) / 10);
    const satu = num % 10;

    if (ratus > 0) {
      if (ratus === 1) temp += "Seratus ";
      else temp += angka[ratus] + " Ratus ";
    }

    if (puluh > 1) {
      temp += angka[puluh] + " Puluh ";
      if (satu > 0) temp += angka[satu] + " ";
    } else if (puluh === 1) {
      if (satu === 0) temp += "Sepuluh ";
      else if (satu === 1) temp += "Sebelas ";
      else temp += angka[satu] + " Belas ";
    } else if (satu > 0) {
      temp += angka[satu] + " ";
    }

    if (temp.trim() !== "") {
      if (i === 1 && num === 1) {
        result = "Seribu " + result;
      } else {
        result = temp + satuan[i] + " " + result;
      }
    }

    n = Math.floor(n / 1000);
    i++;
  }

  return result.trim();
}

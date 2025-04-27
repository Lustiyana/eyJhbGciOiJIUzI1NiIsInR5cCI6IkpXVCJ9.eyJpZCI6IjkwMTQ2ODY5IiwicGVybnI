import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a custom font
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.gstatic.com/s/helvetica.ttf", fontWeight: "normal" },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: "30px 40px",
    fontSize: 11,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  header: {
    backgroundColor: "#FFB81C",
    padding: "10px 20px",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
  tableHeader: {
    backgroundColor: "#FFB81C",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 12,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textRight: {
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
  },
  footer: {
    fontSize: 10,
    fontStyle: "italic",
  },
  section: {
    marginBottom: "32px",
  },
});

function InvoicePDF({ data, totalHarga, terbilangText }) {
  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>RY LESEHAN</Text>

          <View>
            <Text>No: {data.nomor_nota}</Text>
            <Text>Tanggal: {data.tanggal}</Text>
            <Text>Jatuh Tempo: {data.tanggal_jatuh_tempo}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text>Ditujukan kepada: PT. BHUMIADYA</Text>
          <Text>
            Jl. Raya Citatah RT. 03 RW. 10 Citatah - Cipatat, Bandung Barat
          </Text>
        </View>

        {/* Table Section + Total Section Combined */}
        <View style={styles.section}>
          {/* Table Header Row */}
          <View
            style={[
              styles.tableRow,
              {
                borderBottom: "1px solid #000",
                paddingBottom: 4,
                marginBottom: 4,
              },
            ]}
          >
            <Text style={{ flex: 2, fontWeight: "bold" }}>Deskripsi</Text>
            <Text style={{ flex: 2, fontWeight: "bold" }}>Jumlah</Text>
            <Text style={{ flex: 2, fontWeight: "bold", textAlign: "right" }}>
              Harga
            </Text>
          </View>

          {/* Item Rows */}
          <View style={styles.tableRow}>
            <Text style={{ flex: 2, fontWeight: "bold" }}>MAKAN KARYAWAN</Text>
          </View>
          {data.items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={{ flex: 2 }}>{item.date}</Text>
              <Text style={{ flex: 2 }}>{item.quantity}</Text>
              <Text style={{ flex: 2, textAlign: "right" }}>
                Rp.{" "}
                {(Number(data.satuan) * Number(item.quantity)).toLocaleString(
                  "id-ID"
                )}
              </Text>
            </View>
          ))}

          {/* Total Rows */}
          <View
            style={[
              styles.tableRow,
              { marginTop: 8, borderTop: "1px solid #000", paddingTop: 4 },
            ]}
          >
            <Text style={{ flex: 4 }}>Subtotal</Text>
            <Text style={{ flex: 2, textAlign: "right" }}>
              Rp {totalHarga.toLocaleString("id-ID")}
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 4 }}>Diskon</Text>
            <Text style={{ flex: 2, textAlign: "right" }}>-</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 4, fontWeight: "bold" }}>Total</Text>
            <Text style={{ flex: 2, textAlign: "right", fontWeight: "bold" }}>
              Rp {totalHarga.toLocaleString("id-ID")}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>Terbilang: {terbilangText} Rupiah</Text>

        {/* Rekening Dynamic */}
        <Text style={styles.footer}>
          Rekening: {data.rekening.bank.toUpperCase()} a/n {data.rekening.nama_rekening.toUpperCase()} ({data.rekening.nomor_rekening})
        </Text>

        {/* Signature Section */}
        // Di bagian signature InvoicePDF
        <View style={{ marginTop: 40, alignItems: "flex-end" }}>
          <Text>Hormat Saya,</Text>
          <Text style={{ marginTop: 40 }}>{data.penanda_tangan.toUpperCase()}</Text>
        </View>

      </Page>
    </Document>
  );
}

export default InvoicePDF;

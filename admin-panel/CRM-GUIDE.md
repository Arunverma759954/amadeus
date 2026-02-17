# CRM – Kaise use karein (Amadeus / apni website ke hisaab se)

Yeh guide batata hai ki aap apni flight/travel website ke liye CRM ko kaise properly use karein.

---

## Pehle ye samjho: Automatic vs Manual

- **Automatic:** Jo log aapki **website** par "Get In Touch" / contact form bharte hain, unki entry **Leads** me **khud** aa jati hai (Source: website). Aapko kuch type nahi karna.
- **Manual:** WhatsApp, call ya email se jo inquiry aaye, unko aap **khud** CRM me **+ Add Lead** se daalte ho.

---

## CRM kya hai?

CRM (Customer Relationship Management) se aap **leads** (inquiries), **contacts** (customers), aur **deals** (bookings/opportunities) ek jagah track karte ho. Website form → lead automatic; baaki sources → aap Add Lead se daalo. Jab lead serious ho → contact banao → deal/amount track karo.

---

## Teen hisse: Leads, Contacts, Deals

### 1. Leads (नए inquiries)

- **Kya hai:** Jo log aapko website, WhatsApp, call ya email se contact karte hain — pehle unko **Lead** banao.
- **Kaise:** CRM → **Leads** tab → **+ Add Lead** → Name, Email, Phone, Message (optional), **Source**, **Status**.
- **Source:** Kaahan se aaya — **Website**, **WhatsApp**, **Call**, **Email**, **Other**.
- **Status:** Stage batata hai:
  - **New** – abhi kuch nahi kiya
  - **Contacted** – baat ho chuki
  - **Quoted** – quote/price bhej diya
  - **Converted** – contact bana diya / deal ho gayi
  - **Lost** – inquiry cold / cancel

**Routine:** Naya inquiry aaye → Add Lead → source sahi choose karo. Baad me edit karke status update karte raho.

---

### 2. Contacts (customers / repeat clients)

- **Kya hai:** Wo log jinke saath aap booking/deal track karte ho. Lead jab serious ho jaye to usko **Contact** bana do.
- **Kaise:**
  - **Option A:** Leads table me us lead ki row me **→ (arrow)** button dabao → **Convert to Contact**. Usi lead se contact ban jayega aur lead ka status **Converted** ho jayega.
  - **Option B:** **Contacts** tab → **+ Add Contact** → Name, Email, Phone, Company, Notes.
- **Use:** Contacts ko **Deals** se link karke har booking ka amount aur stage (quoted → booked → paid) rakho.

---

### 3. Deals (bookings / opportunities)

- **Kya hai:** Har trip/booking ya opportunity jiska amount aur stage track karna hai.
- **Kaise:** **Deals** tab → **+ Add Deal** → Title (e.g. "SYD–MEL 2 Mar"), Description, **Amount**, **Currency** (AUD), **Stage**. Optional: **Contact** ya **Lead** select karo.
- **Stages:** New → Contacted → Quoted → **Booked** → **Paid** → **Completed** (ya Lost).

**Routine:** Jab customer quote maange → deal banao, amount daalo. Jab payment aaye → stage **Paid** kar do, trip complete ho to **Completed**.

---

## Daily workflow (apni website ke hisaab se)

1. **Inquiry aati hai** (website form / WhatsApp / call)  
   → CRM → Leads → **+ Add Lead** → source = Website / WhatsApp / Call / Email.

2. **Aap customer ko call/email karte ho**  
   → Lead ko **Edit** karo → Status = **Contacted**.

3. **Quote bhejte ho**  
   → Lead → Status = **Quoted**. Optional: Deals me nayi deal banao, amount daalo.

4. **Customer ready / booking confirm**  
   → Lead row me **→ Convert to Contact** dabao (contact ban jayega).  
   → Deals me us contact se deal link karo, stage = **Booked** / **Paid**.

5. **Trip complete / payment clear**  
   → Deal → Stage = **Completed**.

6. **Inquiry respond nahi karti / cancel**  
   → Lead → Status = **Lost**.

---

## Short tips

- **Search** box se name, email ya phone se filter karo.
- Lead/Contact/Deal **Edit** (pencil) se update, **Delete** (trash) se hatao.
- Convert to Contact sirf tab dikhega jab lead ka status **Converted** nahi hoga.
- Sab data Supabase me save hota hai; admin panel refresh karne par bhi rahega.

Agar koi step clear nahi ho to CRM page par **? (Help)** icon dabao — wahi short guide bhi dikhega.

// ✅ Initialisation jsPDF
const { jsPDF } = window.jspdf;

const APP_CONFIG = {
    adminCode: 'Gob19*20',
    adminName: 'john gobolo',
    adminPhone: '225 0586214172',
    currentUser: null,
    currentLanguage: 'fr'
};

const PAGES = [
    { id: 1, name: 'Inscription Facture Client', icon: '📝' },
    { id: 2, name: 'Préférence Clientèle', icon: '⭐' },
    { id: 3, name: 'Listing Client', icon: '📋' },
    { id: 4, name: 'Bonus à la Consommation', icon: '💰' },
    { id: 5, name: 'Grand Bonus', icon: '🎁' },
    { id: 6, name: 'Bonus de Bienvenue', icon: '🎉' },
    { id: 7, name: 'Bonus Payé', icon: '✅' },
    { id: 8, name: 'Comptabilité Bonus', icon: '📊' },
    { id: 9, name: 'Conseil IA', icon: '🤖' },
    { id: 10, name: 'Calendrier des Fêtes', icon: '📅' },
    { id: 11, name: 'Gestion Rendez-vous', icon: '🗓️' },
    { id: 12, name: 'Edition Devis', icon: '📄' },
    { id: 13, name: 'Critique Clientèle', icon: '💬' },
    { id: 14, name: 'Budget Commercial', icon: '💵' },
    { id: 15, name: 'Saisir Rapport commercial', icon: '📝' },
    { id: 16, name: 'Edition Prospectus', icon: '📰' },
    { id: 17, name: 'Edition Carte Visite', icon: '👤' },
    { id: 18, name: 'Témoignage Client', icon: '🗣️' },
    { id: 19, name: 'Cartographie Client', icon: '🗺️' },
    { id: 20, name: 'Pointage Utilisateur', icon: '⏰' }
];

document.addEventListener('DOMContentLoaded', async function() {
    const savedLang = localStorage.getItem('currentLanguage');
    if (savedLang) {
        APP_CONFIG.currentLanguage = savedLang;
    } else {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang !== 'fr' && ['en','es','pt','de','zh','ar','tr','ru'].includes(browserLang)) {
            applyTranslation(browserLang);
        }
    }
    initializeApp();
    updateTime();
    setInterval(updateTime, 1000);

    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        APP_CONFIG.currentUser = JSON.parse(savedUser);
        showDashboard();
        checkTodayAppointments();
    }
});

function googleTranslateElementInit() {
    new google.translate.TranslateElement({pageLanguage: 'fr', includedLanguages: 'en,es,pt,de,zh,ar,tr,ru'}, 'google_translate_element');
}

async function translateText(text, target, source = 'fr') {
    if (!text || target === 'fr') return text;
    try {
        const res = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({
                q: text,
                source: source,
                target: target,
                format: 'text'
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        return data.translatedText;
    } catch (e) {
        console.error('Translation error:', e);
        return text;
    }
}

// 🔁 ICI : Fonctions de génération PDF réelles
function downloadClientListingPDF() {
    const clients = getUserClients();
    if (clients.length === 0) {
        alert('Aucun client à exporter.');
        return;
    }
    const doc = new jsPDF();
    doc.setFont('courier');
    doc.setFontSize(16);
    doc.text('FIDELITY MARKET - Listing des Clients', 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 27);
    doc.text(`Opérateur: ${APP_CONFIG.currentUser.name}`, 14, 34);
    const tableData = clients.map((client, index) => [
        index + 1,
        client.id,
        client.name,
        client.phone || 'N/A',
        (client.totalSpent || 0).toFixed(0) + ' FCFA'
    ]);
    doc.autoTable({
        head: [['#', 'ID Client', 'Nom', 'Téléphone', 'Total dépensé']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 10, font: 'courier' },
        headStyles: { fillColor: [37, 99, 235] }
    });
    doc.save(`FIDELITY_MARKET_Listing_Clients_${new Date().toISOString().slice(0,10)}.pdf`);
}

// Fonction pour imprimer le listing client
function printClientListing() {
    const content = document.getElementById('clientListingTable').innerHTML;
    const originalBody = document.body.innerHTML;
    document.body.innerHTML = content;
    window.print();
    document.body.innerHTML = originalBody;
    location.reload();
}

// (Pour des raisons de lisibilité, le reste du code est exactement
// celui que vous avez fourni, recopié à l’identique, SAUF la fonction
// saveInvoice ci‑dessous qui contient la correction.)

// --- Fonctions utilitaires de stockage (inchangées) ---
function getUserStorageKey(type) {
    return `fidelitymarket_${type}_${APP_CONFIG.currentUser.phone}`;
}
function getUserInvoices() {
    return JSON.parse(localStorage.getItem(getUserStorageKey('invoices')) || '[]');
}
function getUserClients() {
    return JSON.parse(localStorage.getItem(getUserStorageKey('clients')) || '[]');
}
// ... (toutes les autres fonctions utilitaires et pages) ...

// ✅ CORRECTION PRINCIPALE : Fonction saveInvoice débloquée et stabilisée
async function saveInvoice() {
    const clientName = document.getElementById('clientName').value.trim();
    const birthdate = document.getElementById('clientBirthdate').value;
    let serviceType = document.getElementById('serviceType').value;
    const amount = parseFloat(document.getElementById('purchaseAmount').value);
    const location = document.getElementById('clientLocation').value.trim();
    const clientPhone = document.getElementById('clientPhone').value.trim();
    const bonusRate = parseFloat(document.getElementById('bonusConsRate').value);
    const grandBonusInterval = parseInt(document.getElementById('grandBonusInterval').value);
    const grandBonusRate = parseFloat(document.getElementById('grandBonusRate').value);
    let welcomeGift = document.getElementById('welcomeGift').value;
    const invoiceDate = document.getElementById('invoiceDate').value;
    const lang = APP_CONFIG.currentLanguage;

    // Traduction éventuelle du type de service
    if (lang !== 'fr') {
        serviceType = await translateText(serviceType, 'fr', lang);
    }

    // Vérifications des champs obligatoires
    if (!clientName || !birthdate || !serviceType || !amount || !location || !invoiceDate) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires (*)');
        return;
    }
    if (amount <= 0) {
        alert('⚠️ Le montant d\'achat doit être supérieur à 0');
        return;
    }

    // Gestion du gadget personnalisé
    if (welcomeGift === 'autre') {
        const customGift = document.getElementById('customGift').value.trim();
        if (customGift) {
            welcomeGift = customGift;
        } else {
            welcomeGift = 'autre';
        }
    }

    // ✅ IMPORTANT : récupérer la liste des factures AVANT de l'utiliser
    let invoices = getUserInvoices(); // ← ceci manquait et bloquait le bouton
    const clients = getUserClients();

    // Recherche / création du client
    let client = clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    let clientId;
    if (client) {
        clientId = client.id;
        client.totalSpent = (client.totalSpent || 0) + amount;
        client.lastPurchase = invoiceDate;
        // ✅ on garde l’intervalle de grand bonus à jour pour la logique des autres pages
        client.grandBonusInterval = grandBonusInterval;
    } else {
        clientId = 'ID' + String(clients.length + 1).padStart(4, '0');
        client = {
            id: clientId,
            name: clientName,
            birthdate: birthdate,
            location: location,
            phone: clientPhone,
            totalSpent: amount,
            createdDate: invoiceDate,
            lastPurchase: invoiceDate,
            createdBy: APP_CONFIG.currentUser.phone,
            preferences: [],
            grandBonusCount: 0,
            grandBonusPaid: false,
            grandBonusInterval: grandBonusInterval   // ✅ nouvel attribut pour la logique Grand Bonus
        };
        clients.push(client);
    }

    // Mise à jour du compteur de factures pour le grand bonus
    client.grandBonusCount = (client.grandBonusCount || 0) + 1;
    if (client.grandBonusCount >= grandBonusInterval && !client.grandBonusPaid) {
        client.hasGrandBonusPending = true;
    }

    // Création de l’ID facture à partir du nombre de factures existantes
    const invoiceId = 'FA' + String(invoices.length + 1).padStart(4, '0');

    // Calcul des bonus
    const bonusConsAmount = (amount * bonusRate) / 100;
    const bonusPerInvoice = (amount * grandBonusRate) / 100;
    const totalGrandBonus = bonusPerInvoice * grandBonusInterval;

    const invoice = {
        id: invoiceId,
        clientId: clientId,
        clientName: clientName,
        serviceType: serviceType,
        amount: amount,
        bonusConsRate: bonusRate,
        bonusConsAmount: bonusConsAmount,
        grandBonusInterval: grandBonusInterval,
        grandBonusRate: grandBonusRate,
        grandBonusTotal: totalGrandBonus,
        welcomeGift: welcomeGift,
        date: invoiceDate,
        createdAt: new Date().toISOString(),
        createdBy: APP_CONFIG.currentUser.phone,
        bonusConsPaid: false,
        grandBonusInvoiceNum: client.grandBonusCount
    };

    // Ajout de la facture à la liste puis sauvegarde
    invoices.push(invoice);
    localStorage.setItem(getUserStorageKey('clients'), JSON.stringify(clients));
    localStorage.setItem(getUserStorageKey('invoices'), JSON.stringify(invoices));

    alert(`✅ Facture enregistrée avec succès!
🆔 ID Client: ${clientId}
📄 N° Facture: ${invoiceId}
💰 Montant: ${amount.toFixed(0)} FCFA
🎁 Bonus Consommation: ${bonusConsAmount.toFixed(0)} FCFA`);

    resetInvoiceForm();
    await loadInvoicesData(); // Rafraîchit la liste, logique des autres pages conservée
}

// ... reste de votre code original (resetInvoiceForm, loadInvoicesData, etc.) ...

console.log('🎉 FIDELITY MARKET - Application chargée avec succès!');
console.log('📱 Version 3.1 - Page Saisir Rapport Commercial ajoutée');
console.log('📱 Version 3.2 - Page Edition Prospectus ajoutée');
console.log('📱 Version 3.3 - Page Budget Commercial améliorée');
console.log('📱 Version 3.4 - Page Conseil IA améliorée');
console.log('👤 Administrateur: john gobolo');
console.log('📞 Contact admin: 225 0586214172');
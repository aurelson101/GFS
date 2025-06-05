/**
 * Script de chargement des bibliothèques d'export
 * Charge dynamiquement jsPDF et SheetJS pour les exports
 */

// Charger jsPDF pour l'export PDF
function loadJSPDF() {
    return new Promise((resolve, reject) => {
        if (typeof jsPDF !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => {
            console.log('✅ jsPDF chargé');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Erreur chargement jsPDF');
            reject();
        };
        document.head.appendChild(script);
    });
}

// Charger SheetJS pour l'export Excel
function loadSheetJS() {
    return new Promise((resolve, reject) => {
        if (typeof XLSX !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => {
            console.log('✅ SheetJS chargé');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Erreur chargement SheetJS');
            reject();
        };
        document.head.appendChild(script);
    });
}

// Initialiser les bibliothèques au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        loadJSPDF().catch(() => console.warn('jsPDF non disponible - fallback vers impression')),
        loadSheetJS().catch(() => console.warn('SheetJS non disponible - fallback vers CSV'))
    ]).then(() => {
        console.log('📊 Bibliothèques d\'export initialisées');
    });
});

// Export global pour accès depuis les modules
window.ExportLibraries = {
    loadJSPDF,
    loadSheetJS
};
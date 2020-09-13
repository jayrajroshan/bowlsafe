import html2canvas from 'html2canvas'
import jsPdf from 'jspdf'

function printPDF() {
    var w = document.getElementById("print").offsetWidth;
    var h = document.getElementById("print").offsetHeight;
    const domElement = document.getElementById("print")
    html2canvas(domElement, {
        dpi: 300, // Set to 300 DPI
        scale: 3,
        windowWidth: domElement.scrollWidth,
        windowHeight: domElement.scrollHeight,

        onclone: (document) => {
            document.getElementById('print-button').style.visibility = 'hidden'
            document.getElementById('dash').style.visibility = 'hidden'
        }
    })
        .then((canvas) => {
            const img = canvas.toDataURL('image/png')
            const pdf = new jsPDF()
            pdf.addImage(img, 'PNG', 0, 0)
            pdf.save('report.pdf')
            console.log("Printing done")
        })
}
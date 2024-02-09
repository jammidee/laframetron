/**
 * Copyright (C) 2023 Lalulla, Inc. All rights reserved.
 * Copyright (c) 2024 - Joel M. Damaso - mailto:jammi_dee@yahoo.com Manila/Philippines
 * This file is part of Lalulla System.
 * 
 * LaKuboTron Framework is distributed under the terms of the GNU General Public License 
 * as published by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * LaKuboTron System is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE.  See the GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with Lalulla System.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * Framework Designed by: Jammi Dee (jammi_dee@yahoo.com)
 *
 * File Create Date: 01/28/2024 08:40AM
 * Created by: Jammi Dee
 * Modified by: Jammi Dee
 *
*/

//const { ipcRenderer } = require('electron');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

document.getElementById('generatePdfBtn').addEventListener('click', () => {
    generatePdf();
});

function generatePdf() {

    //alert(`Hi1`);
    //Recreate content
    var contentarr = [];
    
    // Add the SI REPORT header
    //contentarr.push({ text: [{ text: 'SI', style: 'reporthead',font:'Impact'}] });
    contentarr.push('This is a sample report generated using pdfmake in ElectronJS.\r\n');
    contentarr.push('You can customize it further as per your requirements.\r\n');

    //alert(`Hi2`);
    const docDefinition = {
        content: contentarr,
        // styles: {
        //     header: {
        //         fontSize: 18,
        //         bold: true,
        //         alignment: 'center',
        //         margin: [0, 0, 0, 20]
        //     }
        // },
        //Lalulla Standard Style - Do not touch!!!
        pageSize: 'LETTER',
        pageOrientation: 'portrait',
        pageMargins: [ 50, 30, 50, 30 ],
        footer: {
            columns: [
                { text: resfooter , alignment: 'center', style: 'small',font:'Arial' }
            ]
        },
        header: {
            columns: [
                { text: resheader , alignment: 'center', style: 'small',font:'Arial' }
            ]
        },
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
            },
            quotes: {
                fontSize: 10,
                alignment: 'left',
                margin: [123, 1, 0, 0],

            },
            small: {
                bold: false,
                fontSize: 10,
                columnGap: 10,
                defaultBorder:true,
                margin: [0, 5, 0, 5],
            },
            tablemargin: {
                margin: [0, 5, 0, 5],
                fontSize: 9,
            },
            table1: {
                fontSize: 8,
                margin: [0, 5, 0, 0],
            },
            lalullaRecord: {
                fontSize: 14,
                alignment: 'center',
                bold: true,
                margin: [0, 20, 0, 2]
            },
            normal: {
                fontSize: 14,
            },
            title: {
                fontSize: 14,
                bold: true,
                decoration:'underline',
            },
            label: {
                fontSize: 12,
                bold: true,
            },
            reporthead: {
                fontSize: 50,
                bold: true,
                alignment:'center',
            },
        },
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);

    pdfDoc.getBase64((data) => {
        ipcRenderer.send('generate-pdfmake', data);
    });
}

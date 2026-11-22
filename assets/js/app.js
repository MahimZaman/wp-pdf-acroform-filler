window.addEventListener('DOMContentLoaded', () => {

    let pdfDoc = null;
    let form = null;
    let fields = [];

    const uploadInput = document.getElementById('pdf-upload');
    const loadButton = document.getElementById('load-pdf');
    const fieldsContainer = document.getElementById('fields-container');
    const generateButton = document.getElementById('generate-pdf');

    if (
        !uploadInput ||
        !loadButton ||
        !fieldsContainer ||
        !generateButton
    ) {
        console.error('Required elements not found');
        return;
    }

    const {
        PDFDocument,
        PDFTextField,
        PDFCheckBox,
        PDFDropdown,
        PDFRadioGroup,
        PDFOptionList
    } = PDFLib;

    /**
     * LOAD PDF
     */
    loadButton.addEventListener('click', async () => {

        try {

            const file = uploadInput.files[0];

            if (!file) {
                alert('Please upload a PDF');
                return;
            }

            const arrayBuffer = await file.arrayBuffer();

            pdfDoc = await PDFDocument.load(arrayBuffer, {
                ignoreEncryption: true
            });

            form = pdfDoc.getForm();

            fields = form.getFields();

            console.log('Detected Fields:', fields);

            fieldsContainer.innerHTML = '';

            if (!fields.length) {

                fieldsContainer.innerHTML = `
                    <div style="color:red;">
                        No AcroForm fields found in this PDF.
                    </div>
                `;

                return;
            }

            fields.forEach((field, index) => {

                const fieldName = field.getName();

                console.log(field);

                const wrapper = document.createElement('div');

                wrapper.style.marginBottom = '20px';
                wrapper.style.padding = '15px';
                wrapper.style.border = '1px solid #ddd';

                const title = document.createElement('div');

                title.innerHTML = `
                    <strong>${fieldName}</strong>
                `;

                title.style.marginBottom = '10px';

                wrapper.appendChild(title);

                /**
                 * TEXT FIELD
                 */
                if (field instanceof PDFTextField) {

                    const input = document.createElement('input');

                    input.type = 'text';
                    input.dataset.field = fieldName;

                    input.style.width = '100%';
                    input.style.padding = '10px';

                    wrapper.appendChild(input);
                }

                /**
                 * CHECKBOX
                 */
                else if (field instanceof PDFCheckBox) {

                    const checkbox = document.createElement('input');

                    checkbox.type = 'checkbox';
                    checkbox.dataset.field = fieldName;

                    wrapper.appendChild(checkbox);
                }

                /**
                 * DROPDOWN
                 */
                else if (field instanceof PDFDropdown) {

                    const select = document.createElement('select');

                    select.dataset.field = fieldName;

                    select.style.width = '100%';
                    select.style.padding = '10px';

                    try {

                        const options = field.getOptions();

                        options.forEach(option => {

                            const optionElement =
                                document.createElement('option');

                            optionElement.value = option;
                            optionElement.textContent = option;

                            select.appendChild(optionElement);
                        });

                    } catch (e) {
                        console.error(e);
                    }

                    wrapper.appendChild(select);
                }

                /**
                 * OPTION LIST
                 */
                else if (field instanceof PDFOptionList) {

                    const select = document.createElement('select');

                    select.dataset.field = fieldName;

                    select.style.width = '100%';
                    select.style.padding = '10px';

                    try {

                        const options = field.getOptions();

                        options.forEach(option => {

                            const optionElement =
                                document.createElement('option');

                            optionElement.value = option;
                            optionElement.textContent = option;

                            select.appendChild(optionElement);
                        });

                    } catch (e) {
                        console.error(e);
                    }

                    wrapper.appendChild(select);
                }

                /**
                 * RADIO GROUP
                 */
                else if (field instanceof PDFRadioGroup) {

                    try {

                        const options = field.getOptions();

                        options.forEach(option => {

                            const radioWrapper =
                                document.createElement('div');

                            radioWrapper.style.marginBottom = '5px';

                            const radio = document.createElement('input');

                            radio.type = 'radio';
                            radio.name = fieldName;
                            radio.value = option;
                            radio.dataset.field = fieldName;

                            const label =
                                document.createElement('label');

                            label.style.marginLeft = '5px';
                            label.innerText = option;

                            radioWrapper.appendChild(radio);
                            radioWrapper.appendChild(label);

                            wrapper.appendChild(radioWrapper);
                        });

                    } catch (e) {
                        console.error(e);
                    }
                }

                /**
                 * UNSUPPORTED
                 */
                else {

                    const unsupported =
                        document.createElement('div');

                    unsupported.style.color = 'red';

                    unsupported.innerHTML = `
                        Unsupported field type
                    `;

                    wrapper.appendChild(unsupported);

                    console.log(
                        'Unsupported Field:',
                        field
                    );
                }

                fieldsContainer.appendChild(wrapper);
            });

            generateButton.style.display = 'inline-block';

        } catch (error) {

            console.error(error);

            alert(
                'Failed to load PDF. Check console for details.'
            );
        }
    });

    /**
     * GENERATE PDF
     */
    generateButton.addEventListener('click', async () => {

        try {

            if (!pdfDoc || !form) {

                alert('Please load a PDF first');

                return;
            }

            fields.forEach(field => {

                const fieldName = field.getName();

                /**
                 * TEXT FIELD
                 */
                if (field instanceof PDFTextField) {

                    const input = document.querySelector(
                        `[data-field="${fieldName}"]`
                    );

                    if (input) {

                        field.setText(input.value || '');
                    }
                }

                /**
                 * CHECKBOX
                 */
                else if (field instanceof PDFCheckBox) {

                    const checkbox = document.querySelector(
                        `[data-field="${fieldName}"]`
                    );

                    if (checkbox) {

                        if (checkbox.checked) {
                            field.check();
                        } else {
                            field.uncheck();
                        }
                    }
                }

                /**
                 * DROPDOWN
                 */
                else if (
                    field instanceof PDFDropdown ||
                    field instanceof PDFOptionList
                ) {

                    const select = document.querySelector(
                        `[data-field="${fieldName}"]`
                    );

                    if (select && select.value) {

                        field.select(select.value);
                    }
                }

                /**
                 * RADIO GROUP
                 */
                else if (field instanceof PDFRadioGroup) {

                    const selected = document.querySelector(
                        `input[name="${fieldName}"]:checked`
                    );

                    if (selected) {

                        field.select(selected.value);
                    }
                }
            });

            /**
             * OPTIONAL:
             * Flatten form
             */
            form.flatten();

            const pdfBytes = await pdfDoc.save();

            const blob = new Blob(
                [pdfBytes],
                {
                    type: 'application/pdf'
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;
            link.download = 'filled-form.pdf';

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

        } catch (error) {

            console.error(error);

            alert(
                'Failed to generate PDF. Check console.'
            );
        }
    });
});
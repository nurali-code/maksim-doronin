$("#fileInput").on("change", function (event) {
    var file = event.target.files[0];
    if (!file) return;

    var reader = new FileReader();
    reader.onload = function (e) {
        var typedarray = new Uint8Array(e.target.result);

        pdfjsLib.getDocument(typedarray).promise.then(function (pdf) {
            var text = "";
            var promises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
                promises.push(
                    pdf.getPage(i).then(function (page) {
                        return page.getTextContent().then(function (content) {
                            return content.items.map(item => item.str).join(" ");
                        });
                    })
                );
            }

            Promise.all(promises).then(function (pagesText) {
                text = pagesText.join("\n\n"); // Объединяем страницы через перенос строки
                $("#output").text(text);
            });
        });
    };
    reader.readAsArrayBuffer(file);
});
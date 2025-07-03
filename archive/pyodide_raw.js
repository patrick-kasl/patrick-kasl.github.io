const fs = require('fs');

(async () => {
    try {
        
        const pyodide = await loadPyodide();
        

        // Load pyodide and packages
        await pyodide.loadPackage("matplotlib");

        // Read the file
        //var html = fs.readFile("./trips.txt", 'utf8');
        fs.readFile("./test_python.py", 'utf8', function (err, html) {
            // console.log(html);
            // Run the Python code
            pyodide.runPython(html);
        });
        } catch (err) {
            console.error(err);
        }
})();
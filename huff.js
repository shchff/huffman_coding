function sortingPairsBubble(m){
   for (let i = 0; i < m.length; i++) {
      for (let j = 0; j < m.length - i - 1; j ++) {
         if (m[j][1] > m[j+1][1]){
            temp = m[j];
            m[j] = m[j+1];
            m[j+1] = temp;
         }
      }
   }
   return m;
}

function createJSON(table) {
   let data = JSON.stringify(table, null, 2);
   fs.writeFile(tableFile, data, (err) => {
      if (err) console.log(err);
      console.log('Создан файл с таблицей кодов');
   });
}


function readJSON() {
   let rawdata = fs.readFileSync(tableFile);
   let table = JSON.parse(rawdata);
   return table;
}


function encode() {
   fs.readFile(from, (err, data) =>{
      let charCode = {};
      let stringArr = data.toString().split("");
      let encoded = "";
      stringArr.forEach(s => charCode[s] = stringArr.filter(i => i == s).length);
      let arr = [];
      for (let key in charCode) {
         arr.push([key, charCode[key]]);
      }
      
      arr = sortingPairsBubble(arr);

      const tree = ps => ps.length < 2 ? ps[0] : tree(sortingPairsBubble([[ps.slice(0, 2), ps[0][1] + ps[1][1]]].concat(ps.slice(2))));

      const codes = (tree, pfx = "") => tree[0] instanceof Array ? Object.assign(codes(tree[0][0], pfx + "0"), codes(tree[0][1], pfx + "1")) : {[tree[0]]: pfx};

      let codesObj = codes(tree(arr));

      for (let i = 0; i < stringArr.length; i++) {
         for (let key in codesObj) {
            if(stringArr[i] == key)
               encoded += codesObj[key].toString();           
         }
      }
      let table = {};

      Object.entries(codesObj).forEach(([key, value]) => {
         table[value] = key
      });

      createJSON(table);
      write(encoded);
      
   });
}


function decode() {
   fs.readFile(from, (err, data) =>{
      let string = data.toString().split("");
      let decoded = "";
      let table = readJSON();
      for (let i = 0; i < string.length; i++){
         if (table.hasOwnProperty(string[i])) {

         } else if (string[i+1] != undefined) {
            string[i + 1] = string[i] + string[i + 1];
            string.splice(i, 1, "^");
         } 
      }

      for (let i = 0; i < string.length; i++) {
         if (string[i] != "^") decoded += table[string[i]];
      }

      write(decoded);
   });
}


function write(text) {
   fs.writeFile(to, text, "utf8", (err) => {
      if (err) {
         console.log(err);
      }
      console.log("Успешно");
   });
}


let fs = require("fs");
let arg = process.argv;
let action = arg[2].toString();
let from = arg[3].toString();
let tableFile = arg[4].toString();
let to = arg[5].toString();

if (action == 'encode') {
   encode();
   
} else if (action == 'decode'){
   decode();
}

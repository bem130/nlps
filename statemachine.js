const fs = require('fs');

function fRead(filename) {
    return fs.readFileSync(filename, 'utf8').replace(/\r\n/g, "\n");
};


function main(filename) {
    let fdata = fRead(filename)
    //console.log(fdata)
    let ret = []
    let state = ""
    ret.push(`let s = state.split(".")`)
    ret.push("if (false) {}")
    const retpush = (transion,sw) => {
        if (transion[1].endsWith("Error")) {
            ret.push(`  ${sw} (s[1]=="${transion[0].split(".")[1]}"${procCond(transion[2])}) { throw this.tokenizeerror(\`${transion[0]} => ${transion[1]}; ${transion[2]}\`,i) }`);
            return
        }
        ret.push(`  ${sw} (s[1]=="${transion[0].split(".")[1]}"${procCond(transion[2])}) { state="${transion[1]}" }`)
    }
    for (let line of fdata.split("\n")) {

        let transion = line.replace(/\s/g, "").match(/^.*?(?=--)|(?<=>).*?(?=:)|(?<=>.*?:).+/g)
        if (transion != null && transion.length == 3) {
            if (transion[0] == transion[1]) { }
            else if (state == transion[0].split(".")[0]) {
                retpush(transion,"else if")
            }
            else {
                state = transion[0].split(".")[0]
                ret.push(`}\nif (s[0]=="${transion[0].split(".")[0]}") {`)
                retpush(transion,"if")
            }

        }
        // ["gVarDef.Colon1","gVarDef.Blank1","space"]
    }
    ret[2] = ret[2].replace("}", "")
    ret.push("}")

//console.table(ret)
    console.log("")
    console.log(ret.join("\n"))
    console.log("")
}
let condition = {
    "space": " ",
    "sharp": "#",
    "exclam": "!",
    "colon": ":",
    "semicolon": ";",
    "LF": "\\n",
}
function procCond(cond) {
    let ret = ""
    for (let c of cond.split("&")) {
        let r = "";
        if (c[0] == "!") {
            r = "!"
            c = c.slice(1)
        }
        switch (c) {
            case "space":
            case "sharp":
            case "exclam":
            case "colon":
            case "semicolon":
            case "LF":
                ret += `&&(${r}(this.code[i]=="${condition[c]}"))`;
                break;
            case "decl=(\"include\"|\"using\")":
                ret += `&&(${r}(tokenarr[tokenarr.length-1].val=="include"||tokenarr[tokenarr.length-1].val=="using"))`;
                break;
            case "decl=(\"fn\"|\"global\")":
                ret += `&&(${r}(tokenarr[tokenarr.length-1].val=="fn"||tokenarr[tokenarr.length-1].val=="global"))`;
                break;
            case "decl=\"fn\"":
                ret += `&&(${r}(tokenarr[tokenarr.length-1].val=="fn"))`;
                break;
            case "decl=\"global\"":
                ret += `&&(${r}(tokenarr[tokenarr.length-1].val=="global"))`;
                break;
            default:
                // throw "errorrrrrrrr"
                break;
        }
    }
    return ret
}
main("./spec/nlp-tokenizer-statetransition.md")

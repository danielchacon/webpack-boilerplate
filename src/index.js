import './styles/main.scss'

function importAll(r) {
    r.keys().forEach(r);
}

if (process.env.NODE_ENV === "development") {
    importAll(require.context("./pages/", true, /\.pug$/));
}

console.log("Hi, everyone!");

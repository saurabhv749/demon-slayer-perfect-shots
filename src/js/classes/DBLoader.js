import localforage from "localforage";

export default class DBLoader {
  constructor() {
    this.gistID = "e9710f362b2ee1fb957200d437493ead";
    this.isLoaded = false;
    this.db = null;

    this.checkDB();
  }

  async getLatestVersion() {
    const r = await fetch(
      `https://api.github.com/gists/${this.gistID}?gist_id=GIST_ID`
    );

    const data = await r.json();
    const { history } = data;
    const { version, committed_at } = history[0];
    //
    return version;
  }

  async checkDB() {
    const db = await localforage.getItem("kimetsu");
    const version = await localforage.getItem("dbVersion");
    const latestVersion = await this.getLatestVersion();

    if (db !== null && version === latestVersion) {
      this.isLoaded = true;
      this.db = db;
      console.log("database loaded");
    } else {
      this.downloadDB(latestVersion);
    }
  }

  async downloadDB(v) {
    this.dbURL = `https://gist.githubusercontent.com/saurabhv749/${this.gistID}/raw/${v}/demon-salyer.json`;
    const resp = await fetch(this.dbURL);
    const data = await resp.json();

    localforage
      .setItem("dbVersion", v)
      .then((v) => {
        console.log("db version: ", v);
      })
      .catch((err) => {
        console.log("database version update failed.", err);
      });

    localforage
      .setItem("kimetsu", data)
      .then((value) => {
        this.isLoaded = true;
        this.db = value;

        console.log("database loaded");
      })
      .catch((err) => {
        console.log("database loading failed.", err);
      });
  }

  // api
  getStore() {
    return this.db.store;
  }

  getCharacters() {
    // for home
    return this.db.characters;
  }

  getCharacter(char) {
    // single character
    return this.db.galleries.find((x) => x.id === char);
  }
}

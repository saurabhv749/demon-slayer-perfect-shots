import { loadFonts } from "./utils";
import Preloader from "./classes/Preloader";
import Canvas from "./classes/Canvas";
import DBLoader from "./classes/DBLoader";

import Home from "./pages/home";
import About from "./pages/about";
import Collection from "./pages/collection";

const FONTS_TO_LOAD = ["Barlow Semi Condensed", "Righteous"];

class App {
  constructor() {
    this.viewport = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.database = new DBLoader();

    // add listener
    this.disableLinks();
    this.addEventListeners();
    loadFonts(FONTS_TO_LOAD, this.start.bind(this));
  }

  /**
   * Assets
   */

  start() {
    // load db
    this.dbFrame = window.requestAnimationFrame(this.start.bind(this));

    if (this.database.isLoaded) {
      const store = this.database.getStore();
      this.data = this.database.getCharacters();

      window.cancelAnimationFrame(this.dbFrame);
      this.preloader = new Preloader(this.data, store);
      this.isAssetLoaded();
    }
  }

  isAssetLoaded() {
    this.frame = requestAnimationFrame(this.isAssetLoaded.bind(this));

    if (this.preloader.loading.isLoaded) {
      window.cancelAnimationFrame(this.frame);
      this.canvas = new Canvas(this.viewport, this.data);

      this.pages = {
        home: new Home(this.canvas, 1, this.data),
        about: new About(this.canvas, 2),
        collection: new Collection(this.canvas, 3, this.database),
      };
      this.page = this.pages.home;

      this.createPage();
    }
  }

  disableLinks() {
    this.links = document.querySelectorAll("a[data-nav]");

    this.links.forEach((l) => {
      l.onclick = this.navigate.bind(this);
    });
  }

  /**
   * Page
   */

  async setPage(path) {
    let p;
    if (path === "/demon-slayer-perfect-shots/") {
      p = this.pages.home;
    } else if (path.includes("/demon-slayer-perfect-shots/characters")) {
      p = this.pages.collection;
    } else if (path === "/demon-slayer-perfect-shots/about") {
      p = this.pages.about;
    } else {
      p = this.pages.home;
      history.pushState(null, null, "/demon-slayer-perfect-shots/");
    }

    this.inTransition = true;
    await this.page.animateOut();
    this.page = p;
    this.pageID = this.page.id;
    await this.page.animateIn();
    this.canvas.activePage = this.canvas.scene.children[this.page.pageIndex];
    this.inTransition = false;
  }

  navigate(e) {
    e.preventDefault();
    const path = e.target.getAttribute("href");

    if (this.inTransition) return;
    else if (path === window.location.pathname) return;

    // history
    history.pushState(null, null, path);
    this.setPage(path);
  }

  onPopstate() {
    const path = window.location.pathname;
    this.setPage(path);
  }

  createPage() {
    const path = window.location.pathname;
    this.setPage(path);
  }

  // events

  resize() {
    this.viewport.w = window.innerWidth;
    this.viewport.h = window.innerHeight;

    this.canvas.resize();
    this.page.resizePlanes();
  }

  addEventListeners() {
    window.addEventListener("resize", this.resize.bind(this));

    window.addEventListener("popstate", this.onPopstate.bind(this));
  }
}

new App();

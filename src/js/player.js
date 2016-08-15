import _ from './lib.js';

class Player {
  constructor(opt) {
    this.init(opt);
  }
  init(opt) {
    if (!opt || !opt.audioSrc) return;
    this.cfg = opt;

    this.createDom();
    this.cacheDom();

    // load lrc
    if (opt.lrcSrc) {
      this.getLrc(opt.lrcSrc, this.lrcReady.bind(this));
      _.showLoading(this.lrcList);
    }

    this.reset();

    this.setLrcListHeight();

    this.initEvents();
  }
  createDom() {
    // select dom
    if (this.cfg.el) {
      let ele = _.$(this.cfg.el);
      if (ele.tagName === 'SCRIPT') ele = ele.parentNode.insertBefore(document.createElement('div'), ele);
      this.ele = ele;
    } else {
      this.ele = document.body.appendChild(document.createElement('div'));
    }

    // add class
    this.ele.classList.add('ai-player-container');

    // dom elements
    let str = `<div class="player-bg" style="background-image: url('${this.cfg.poster}');"></div>
      <section class="ai-player-info">
        <h2 class="ai-title">${this.cfg.title}</h2>
        <p class="ai-description">${this.cfg.description}</p>
      </section>
      <section class="ai-player-lrc">
        <ul class="lrc-list"></ul>
      </section>
      <section class="ai-player-ctrl">
        <button type="button" class="ai-player-prev">pre</button>
        <button type="button" class="ai-player-play ai-player-pause">play/pause</button>
        <button type="button" class="ai-player-next">next</button>
      </section>
      <audio preload src="${this.cfg.audioSrc}"></audio>`;
    this.ele.innerHTML = str;
  }
  cacheDom() {
    // audio elements and load audio
    this.audio = this.ele.querySelector('audio');

    // ctrl elements
    // this.prevEle = this.ele.querySelector('.ai-player-prev');
    this.playEle = this.ele.querySelector('.ai-player-play');
    // this.nextEle = this.ele.querySelector('.ai-player-next');

    // lrcList elements
    this.lrcList = this.ele.querySelector('.lrc-list');
  }
  setLrcListHeight() {
    // set lrcList height
    let hei1 = this.ele.clientHeight;
    let hei2 = this.ele.querySelector('.ai-player-info').clientHeight;
    let hei3 = this.ele.querySelector('.ai-player-ctrl').clientHeight;
    this.lrcList.style.height = hei1 - hei2 - hei3 + 'px';
  }
  initEvents() {
    // audio load
    // this.audio.addEventListener('canplay', (e) => console.log(e), false);
    this.playEle.addEventListener('click', (e) => {
      if (this.playEle.className.indexOf('ai-player-pause') >= 0) return this.play();
      this.pause();
    });
    this.audio.addEventListener('timeupdate', this.updateLyric.bind(this));
    this.audio.addEventListener('ended', (e) => this.reset());
  }
  getLrc(url, callback) {
    _.ajax({
      url: url,
      type: 'get',
      success: (data) => {
        if (typeof callback === 'function') callback(data);
      },
      error: (data) => {
        console.error(data);
      }
    });
  }
  lrcReady(data) {
    this.original = { rc: data };

    // parse lrc
    this.source = this.parseLrc(data);

    // render lrc
    this.renderLrc(this.lrcList, this.source.lrc);
    this.lineHeight = this.lrcList.querySelector('li').clientHeight;
  }
  reset() {
    // currentTime flag
    this.currentLine = 0;
    this.currentTime = 0;
    if (this.currentEle) this.currentEle.classList.remove('on');
    this.currentEle = null;
    this.playEle.classList.add('ai-player-pause');
    this.lrcList.scrollTop = 0;
  }
  play() {
    this.audio.play();
    this.playEle.classList.remove('ai-player-pause');
  }
  pause() {
    this.audio.pause();
    this.playEle.classList.add('ai-player-pause');
  }
  parseLrc(text) {
    // get each line from the text
    let lines = text.split('\n');

    // this regex mathes the time [mm:ss.ffff]
    let pattern = /\[(\d{2})\:(\d{2})\.(\d{0,4})\]/g;
    let result = { lrc: {}, len: 0 };

    // remove the last empty item
    lines[lines.length - 1].length === 0 && lines.pop();

    lines.forEach(function (val, index) {
      var arr = val.match(/\[(.+)\](.+)?/);
      if (arr && arr[2]) {
        let date = arr[1].match(/(\d{2}):(\d{2})/);
        let time = ((~~date[1]) * 60) + (~~date[2]);
        result.lrc[time] = { date: arr[1], time: time, content: arr[2] };
        result.len++;
      }
    });

    return result;
  }
  renderLrc(ele, lrc) {
    if (!ele || !lrc) return;
    let str = '';
    for (let i in lrc) {
      let v = lrc[i];
      str += `<li class="item" data-id="${v.time}">${v.content}</li>`;
    }
    ele.innerHTML = str;
  }
  updateLyric(ev) {
    let audio = ev.target;

    // currentTime
    var currentTime = ~~audio.currentTime;
    if (!this.source.lrc[currentTime] || this.currentTime === currentTime) return;
    this.currentTime = currentTime;
    this.currentLine++;
    if (this.currentEle) this.currentEle.classList.remove('on');
    this.currentEle = this.lrcList.querySelector(`li:nth-child(${this.currentLine})`);
    this.currentEle.classList.add('on');
    if (this.currentLine > 5 && this.currentLine + 5 <= this.source.len) this.lrcList.scrollTop = (this.currentLine - 5) * this.lineHeight;
  }
}

export default Player;

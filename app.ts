//
// e-hentai ページより著作者の英名・和名を取得
//

import * as cheerio from "cheerio-httpcli";
import * as async from "async";
import * as fs from "fs";

interface Queue { url: string; }
interface Callback { (): void; }

var artist = {};

class e_hentai {
  url:string = '';
  urls:string[] =[];
  callback:Callback = null;

  constructor(url:string, cb:Callback ) {
    this.url = url;
    this.callback = cb;
  }

  getArti():void {
    var q:AsyncQueue<Queue> = async.queue<Queue, Error>( (list, qnext) => {
      var msg:Error = null;

      cheerio.fetch(list.url, (err, $, res, body) => {
        if ( err ) {
          console.log( ' err=' + err + '  url=' + list.url );
        } else {
          var gn = $('#gn').text().match( /^\[([^\]]*)\]/);
          var gj = $('#gj').text().match( /^\[([^\]]*)\]/);
          var gnn = [];
          var gjn = [];
          if ( gn != null && gn.length > 1 ) {
            gnn = gn[1].toLowerCase().split( ',' );
          }
          if ( gj != null && gj.length > 1 ) {
            gjn = gj[1].split( '、' );
          }

          if ( gnn.length == gjn.length ) {
            for ( var i = 0; i < gnn.length ; i++ ) {
              console.log( '\"' + gnn[i].trim() + '\"\t\"' + gjn[i].trim() + '\"' );
            }
          }
        }

        // 1秒後に続きを
        setTimeout( () => {
          qnext( msg );
        }, 1000);
      });
    }, 1);

    // 待ち行列を完了後に呼ばれる
    q.drain = () => {
      console.log( 'finish get name');
      this.callback();
    };
    // 待ち行列キューへの追加
    this.urls.forEach( (val) => {
      q.push( { url: val });
    });
  }

  getList():void {
    console.log( this.url );
    cheerio.fetch(this.url, (err, $, res, body) => {
      if ( err ) {
        console.log( ' err=' + err + '  url=' + this.url );
      } else {
        // リンク一覧を表示
        $('div.it5').each( (idx, el) => {
          var n = $(el).find('a').text().match( /^\[([^\]]*)\]/)
          if ( n != null && n.length > 1 ) {
            var nn = n[1].toLowerCase().split( ',' );
            var f = 1;
            for ( var i = 0; i < nn.length; i++ ) {
              if ( ! artist[nn[i].trim()] ) {
                f = 0;
                artist[nn[i].trim()] = '1';
              }
              // console.log( i + ':' + nn[i].trim() + '  /  ' + artist[nn[i].trim()] + ' : ' + f);
            }
            // 著作者リストに未登録の時に、情報収集対象に加える。
            if ( f == 0 ) {
              //console.log( n[1] );
              this.urls.push($(el).find('a').attr('href'));
            }
          }
        });

        // this.urls.forEach( (val) => {
        //   console.log( val );
        // });

        if ( this.urls.length == 0 ) {
          console.log( 'skip get name');
          this.callback();
        } else {
          this.getArti();
        }
      }
    });
  }
}

var argv = process.argv;
const cmd = argv.shift();
const script = argv.shift();

// 著作者リストを読み込む
var list = JSON.parse(fs.readFileSync('artist.json', 'utf8'));
list.forEach( (val) => {
  artist[val.namee] = '1';
});

// 引数なし、または、引数が1つでかつ数字の場合
if ( argv.length == 0 || (argv.length == 1 && Number(argv[0]) > 0)) {
  var qu:AsyncQueue<Queue> = async.queue<Queue, Error>( (list, qnext) => {
    var msg:Error = null;

    var e = new e_hentai( list.url, () => {
      // 1秒後に続きを
      setTimeout( () => {
        qnext( msg );
      }, 1000);
    });
    e.getList();
  }, 1);

  // 待ち行列を完了後に呼ばれる
  qu.drain = () => {
    console.log( 'finish get list');
  };
  // 待ち行列キューへの追加
  qu.push( { url: 'http://g.e-hentai.org/manga' });
  for ( var i = 1; i <= Number(argv[0]); i++ ) {
    qu.push( { url: 'http://g.e-hentai.org/manga/' + i });
  }
} else {
  // 引数をURL指定として処理する
  argv.forEach( (arg) => {
    console.log( 'arg=' + arg );
    var e = new e_hentai( arg, () => {} );
    e.getList();
  });
}

# e-hentai アーティストリスト取得

## 使い方
http://g.e-hentai.org/manga よりアーティスト情報を取得
```
npm install
echo '[]' > artist.json
npm start
```
artist.json に記載しているアーティストは取得をスキップする。


## 使い方2
http://g.e-hentai.org/manga 〜 http://g.e-hentai.org/manga/100 よりアーティスト情報を取得
```
node_modules/typescript/bin/tsc
echo '[]' > artist.json
node app.js 100
```

## 出力例
```
http://g.e-hentai.org/manga/533
"tachibana kai"	"橘海衣"
"toudou kurei"	"藤堂玖麗"
"nakahara tomo"	"中原とも"
"nanahoshi keina"	"七星けいな"
"moriya neko"	"もりやねこ"
"hirihori harimoru"	"ひりほりはりもる"
"saeki"	"佐伯"
finish get name
```

## artist.json の記述例
```
[{ "namee":"089taro", "namej":"089タロー"},
{ "namee":"100 yen locker", "namej":"100円ロッカー"},
{ "namee":"100yen locker", "namej":"100円ロッカー"}]
```

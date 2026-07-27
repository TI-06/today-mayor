export const METRICS = ['budget','support','economy','life','environment','safety'];
export const METRIC_LABELS = {budget:'財政',support:'支持率',economy:'経済',life:'暮らし',environment:'環境',safety:'安心'};
export const POLICY_CATEGORIES = ['経済','福祉','教育','環境','防災','観光','交通','デジタル'];

const choice = (id,label,summary,effects,tags=[]) => ({id,label,summary,effects,tags});
export const POLICIES = [
  {id:'empty-shops',category:'経済',district:'中央',requester:'商店会長',icon:'🏪',title:'空き店舗を若手に貸したい',body:'商店街の空き店舗を、起業したい若者へ安く貸す案です。市が改装費を負担するか判断してください。',choices:[choice('grant','改装費を全額支援','予算を使い、商店街を一気に再生する',{budget:-12,economy:9,life:3,support:2}),choice('half','半額だけ支援','負担を分け、堅実に進める',{budget:-6,economy:5,life:2,support:1}),choice('market','民間に任せる','財政は守れるが、再生は遅い',{budget:2,economy:-2,support:-2})]},
  {id:'school-lunch',category:'教育',district:'学園',requester:'保護者代表',icon:'🍱',title:'学校給食を無償化する？',body:'物価高で給食費の負担が増えています。全世帯を無償化する案が提出されました。',choices:[choice('free','全員無償化','子育て世帯を強く支援',{budget:-14,life:10,support:6}),choice('target','所得制限付き','必要な家庭へ重点支援',{budget:-7,life:6,support:2}),choice('keep','現状維持','財政を優先する',{budget:3,life:-4,support:-5})]},
  {id:'river-park',category:'環境',district:'河川',requester:'環境団体',icon:'🌳',title:'河川敷を大きな公園に',body:'使われていない河川敷を、防災機能を備えた公園へ整備する計画です。',choices:[choice('large','大規模整備','環境と防災を同時に改善',{budget:-15,environment:10,safety:6,life:4}),choice('small','小規模整備','段階的に進める',{budget:-7,environment:5,safety:2,life:2}),choice('parking','駐車場にする','収益は出るが緑地は減る',{budget:7,economy:3,environment:-8,support:-1})]},
  {id:'night-bus',category:'交通',district:'住宅',requester:'夜勤労働者',icon:'🚌',title:'深夜バスを増便してほしい',body:'病院や工場の夜勤者から、終電後の交通手段を求める声が上がっています。',choices:[choice('daily','毎日運行','利便性を最優先',{budget:-9,life:7,economy:3,support:3}),choice('weekend','週末だけ運行','需要を見ながら試す',{budget:-4,life:4,economy:1}),choice('taxi','タクシー補助','対象者を限定する',{budget:-5,life:3,support:1})]},
  {id:'flood-wall',category:'防災',district:'河川',requester:'消防署長',icon:'🌊',title:'堤防の耐久性に不安',body:'最新調査で一部区間の劣化が判明しました。大雨シーズン前に補強するか決めます。',choices:[choice('urgent','緊急補強','高額だが安全を確保',{budget:-18,safety:14,support:3}),choice('critical','危険区間だけ','費用と安全を両立',{budget:-9,safety:8}),choice('next','来年度へ延期','予算は守れるが危険が残る',{budget:5,safety:-10,support:-4},['flood-risk','chain:flood-after'])]},
  {id:'tourism-video',category:'観光',district:'港',requester:'観光協会',icon:'🎬',title:'街のPR動画を制作する',body:'人気クリエイターを起用し、SNS向けの観光動画を作る提案です。',choices:[choice('famous','人気クリエイターに依頼','拡散力を狙う',{budget:-10,economy:8,support:4},['chain:viral-backlash']),choice('citizen','市民公募で作る','地域参加型で制作',{budget:-4,economy:4,life:2,support:2}),choice('none','制作しない','観光予算を温存',{budget:2,economy:-3})]},
  {id:'online-office',category:'デジタル',district:'中央',requester:'DX推進室',icon:'💻',title:'市役所手続きをオンライン化',body:'住民票や各種申請をスマホで完結させる計画です。初期費用は大きめです。',choices:[choice('full','一括オンライン化','利便性を大きく改善',{budget:-13,life:9,economy:2,support:4},['chain:digital-gap']),choice('phase','主要手続きから','段階的に導入',{budget:-7,life:5,support:2}),choice('counter','窓口を維持','高齢者には安心だが効率は上がらない',{budget:-2,life:1,economy:-2})]},
  {id:'clinic',category:'福祉',district:'住宅',requester:'医師会',icon:'🏥',title:'休日診療所を新設する？',body:'休日の救急外来が混雑しています。市営の診療所を開く案です。',choices:[choice('open','常設する','安心を大幅に高める',{budget:-16,life:8,safety:8,support:4}),choice('rotate','輪番制を支援','既存病院を活用する',{budget:-8,life:5,safety:5}),choice('information','相談窓口だけ','低予算だが効果は限定的',{budget:-3,life:2,safety:1})]},
  {id:'factory',category:'経済',district:'工業',requester:'企業誘致担当',icon:'🏭',title:'大型工場を誘致したい',body:'雇用は増えますが、交通量と環境負荷も増える見込みです。',choices:[choice('invite','優遇して誘致','雇用を大きく増やす',{budget:-8,economy:14,environment:-9,life:-2},['chain:factory-protest']),choice('conditions','環境条件付き','成長と環境を両立',{budget:-5,economy:8,environment:-2}),choice('decline','断る','環境を守る',{economy:-5,environment:5,support:1})]},
  {id:'library',category:'教育',district:'学園',requester:'高校生代表',icon:'📚',title:'図書館を夜10時まで開けて',body:'学生と社会人から開館時間延長の要望が届いています。',choices:[choice('late','毎日延長','学習環境を改善',{budget:-6,life:5,support:3}),choice('exam','試験期だけ','需要が高い時期に限定',{budget:-3,life:3,support:1}),choice('keep','現状維持','人件費を抑える',{budget:1,life:-2,support:-2})]},
  {id:'solar',category:'環境',district:'工業',requester:'エネルギー会社',icon:'☀️',title:'公共施設へ太陽光パネル',body:'初期費用をかけて、将来の電気代と排出量を減らす計画です。',choices:[choice('all','全施設へ導入','長期投資を行う',{budget:-12,environment:12,economy:2}),choice('schools','学校から導入','教育効果も狙う',{budget:-6,environment:7,life:1}),choice('wait','価格低下を待つ','今回は見送る',{budget:2,environment:-2})]},
  {id:'camera',category:'防災',district:'中央',requester:'警察署長',icon:'📷',title:'繁華街に防犯カメラを増設',body:'犯罪抑止への期待と、プライバシーへの懸念が出ています。',choices:[choice('many','重点地区に増設','安全を優先',{budget:-7,safety:10,support:2}),choice('limited','通学路だけ','必要箇所に限定',{budget:-4,safety:6,support:1}),choice('patrol','人の巡回を増やす','雇用も増える',{budget:-8,safety:7,economy:2})]},
  {id:'festival',category:'観光',district:'中央',requester:'若手商業者',icon:'🎆',title:'夏祭りを復活させたい',body:'中止が続いていた夏祭りを、市の補助で復活させる提案です。',choices:[choice('big','大規模開催','街全体を盛り上げる',{budget:-11,economy:9,life:6,support:5},['chain:festival-noise']),choice('local','地区開催','小さく再開する',{budget:-5,economy:4,life:4,support:2}),choice('none','今年も中止','安全と財政を優先',{budget:2,life:-3,support:-4})]},
  {id:'bike',category:'交通',district:'中央',requester:'自転車利用者',icon:'🚲',title:'自転車レーンを整備する',body:'事故防止と渋滞緩和のため、主要道路に専用レーンを作る案です。',choices:[choice('network','市内一帯に整備','交通を大きく変える',{budget:-13,safety:8,environment:7,life:3}),choice('core','中心部だけ','効果の高い場所から',{budget:-6,safety:5,environment:3}),choice('paint','路面表示のみ','低予算で対応',{budget:-2,safety:2})]},
  {id:'elder-tech',category:'デジタル',district:'住宅',requester:'自治会長',icon:'📱',title:'高齢者向けスマホ教室',body:'行政手続きのオンライン化に合わせ、無料教室を開催する提案です。',choices:[choice('weekly','毎週開催','丁寧に支援する',{budget:-5,life:6,support:4}),choice('monthly','月1回開催','費用を抑えて継続',{budget:-2,life:3,support:2}),choice('guide','冊子を配る','最小限の対応',{budget:-1,life:1})]},
  {id:'childcare',category:'福祉',district:'住宅',requester:'保育士',icon:'🧸',title:'保育士の待遇を改善する',body:'人手不足で待機児童が増えています。市独自の手当を設ける案です。',choices:[choice('raise','大幅な手当','人材確保を優先',{budget:-12,life:10,support:5,economy:2}),choice('small','小額手当','段階的に改善',{budget:-6,life:6,support:2}),choice('training','研修支援のみ','直接的な待遇改善はしない',{budget:-3,life:2})]},
  {id:'port-market',category:'観光',district:'港',requester:'漁協代表',icon:'🐟',title:'朝市を観光名所にしたい',body:'港の朝市を改修し、観光客も楽しめる施設へ変える計画です。',choices:[choice('renovate','全面改修','港の目玉を作る',{budget:-12,economy:11,life:3}),choice('events','週末イベント','低予算で集客',{budget:-4,economy:6,life:2}),choice('local','地元向けを守る','観光化を控える',{life:3,economy:-2})]},
  {id:'tree-street',category:'環境',district:'中央',requester:'景観審議会',icon:'🌿',title:'駅前通りを緑化する',body:'街路樹とベンチを増やし、歩きやすい中心街を作る案です。',choices:[choice('full','車線を減らして緑化','大胆に歩行者中心へ',{budget:-10,environment:9,life:6,economy:2}),choice('trees','街路樹だけ増やす','現在の交通を維持',{budget:-5,environment:5,life:2}),choice('banner','装飾だけ変える','見た目を低予算で改善',{budget:-2,support:1})]},
  {id:'coding',category:'教育',district:'学園',requester:'IT企業',icon:'🤖',title:'放課後プログラミング教室',body:'地元企業が講師を派遣し、市が会場と機材費を負担します。',choices:[choice('all','全小学校で開催','将来人材へ投資',{budget:-8,life:5,economy:5,support:3}),choice('pilot','3校で試行','効果を検証する',{budget:-3,life:3,economy:2}),choice('private','民間教室に任せる','市は関与しない',{budget:1,life:-1})]},
  {id:'ev-bus',category:'交通',district:'工業',requester:'交通局長',icon:'🔋',title:'市バスをEVへ置き換える',body:'古いバスの更新時期です。電気バスは高額ですが、排出量と騒音を減らせます。',choices:[choice('all','一括更新','環境都市を目指す',{budget:-18,environment:12,life:4,support:3}),choice('half','半数を更新','現実的に移行',{budget:-10,environment:7,life:2}),choice('diesel','従来車へ更新','費用を抑える',{budget:-5,environment:-4})]}
];

export const INCIDENTS = [
 {id:'downpour',title:'ゲリラ豪雨が発生',icon:'⛈️',mood:'panic',condition:s=>s.safety<65||s.flags.includes('flood-risk'),body:'短時間の豪雨で河川が急上昇しています。避難所を開設しますか？',choices:[choice('open','すぐ全避難所を開く','費用はかかるが安全を優先',{budget:-8,safety:8,support:5}),choice('limited','危険地区だけ開く','対象を絞って対応',{budget:-4,safety:4,support:1}),choice('watch','様子を見る','判断が遅れる可能性',{budget:1,safety:-9,support:-7})]},
 {id:'viral',title:'街の猫動画が突然バズる',icon:'🐈',mood:'happy',condition:s=>s.economy<75,body:'港で撮影された猫動画が全国的に拡散。観光客が急増しています。',choices:[choice('campaign','公式企画にする','勢いを観光へつなげる',{budget:-4,economy:10,support:5}),choice('safety','混雑対策を優先','事故を防ぎながら受け入れる',{budget:-3,economy:5,safety:4}),choice('leave','静観する','自然な流行に任せる',{economy:3})]},
 {id:'scandal',title:'市役所職員の不適切投稿',icon:'📱',mood:'worried',condition:s=>s.support>35,body:'職員の匿名SNS投稿が市民を侮辱しているとして炎上しています。',choices:[choice('disclose','調査結果を公開','透明性を優先',{support:6,budget:-2}),choice('discipline','即時処分','早く厳しく対応',{support:2,life:-1}),choice('ignore','個人の問題とする','炎上が長引く',{support:-9})]},
 {id:'blackout',title:'工業地区で大規模停電',icon:'⚡',mood:'panic',condition:s=>s.environment<60||s.economy>55,body:'工場と住宅の一部で停電が発生。復旧まで数時間かかる見込みです。',choices:[choice('generator','非常電源を配布','事業と生活を守る',{budget:-7,safety:6,economy:3}),choice('hospital','病院を最優先','命に関わる施設を守る',{budget:-4,safety:8,life:2}),choice('wait','電力会社に任せる','市の支出はない',{economy:-6,life:-4,support:-3})]},
 {id:'donation',title:'匿名で1億円の寄付',icon:'💴',mood:'proud',condition:s=>s.budget<70,body:'用途を指定しない多額の寄付が届きました。何に使うか注目されています。',choices:[choice('reserve','防災基金へ','将来の危機に備える',{budget:10,safety:5}),choice('children','子育て施策へ','暮らしへ還元する',{budget:4,life:8,support:4}),choice('investigate','出所を調査','慎重さを示す',{budget:7,support:2})]},
 {id:'wild-boar',title:'住宅街にイノシシ出没',icon:'🐗',mood:'panic',condition:s=>s.environment>45,body:'公園付近で目撃が相次ぎ、通学路の安全が心配されています。',choices:[choice('capture','専門業者へ依頼','迅速に捕獲する',{budget:-4,safety:6}),choice('close','公園を一時閉鎖','接触を防ぐ',{life:-2,safety:4}),choice('sign','注意看板を設置','低予算だが不安が残る',{budget:-1,safety:1,support:-2})]},
 {id:'ruins',title:'工事現場から遺跡を発見',icon:'🏺',mood:'thinking',condition:s=>s.economy>45,body:'道路工事中に歴史的価値のありそうな遺構が見つかりました。',choices:[choice('survey','工事を止めて調査','文化資産を守る',{budget:-8,economy:-3,support:4}),choice('partial','一部だけ保存','工期と保存を両立',{budget:-4,economy:-1,support:2}),choice('continue','工事を優先','経済は守れるが批判も',{economy:4,support:-6})]},
 {id:'heatwave',title:'記録的な猛暑',icon:'🌡️',mood:'worried',condition:s=>s.day%10>4,body:'熱中症搬送が増えています。高齢者と子どもの対策が急務です。',choices:[choice('shelter','涼み処を開設','公共施設を無料開放',{budget:-5,life:6,safety:5}),choice('water','給水所を増設','屋外対策を進める',{budget:-3,safety:4}),choice('alert','注意喚起のみ','費用は抑えられる',{budget:-1,safety:-2,support:-2})]},
 {id:'celebrity',title:'人気俳優が移住を発表',icon:'⭐',mood:'happy',condition:s=>s.life>50,body:'街の暮らしやすさが話題になり、取材依頼が殺到しています。',choices:[choice('ambassador','観光大使を依頼','話題を最大限活用',{budget:-3,economy:8,support:5}),choice('privacy','静かに見守る','住民として尊重する',{life:3,support:2}),choice('event','歓迎イベント','街を盛り上げる',{budget:-5,economy:5,life:3})]},
 {id:'strike',title:'ごみ収集職員がストライキ',icon:'🗑️',mood:'worried',condition:s=>s.life<65,body:'待遇改善を求め、収集業務の一部が停止しています。',choices:[choice('negotiate','待遇を改善','根本的に解決する',{budget:-8,life:7,support:4}),choice('temp','民間へ一時委託','早期に収集を再開',{budget:-6,life:4}),choice('hard','要求を拒否','長期化の恐れ',{budget:2,life:-8,support:-6})]}
];

export const RESIDENTS=[
 {id:'aki',name:'秋山ミオ',role:'子育て世帯代表',icon:'👩‍👧',interests:['福祉','教育'],likes:['life','support'],dislikes:['safety']},
 {id:'gen',name:'源さん',role:'商店会長',icon:'🧑‍🍳',interests:['経済','観光'],likes:['economy','budget'],dislikes:['life']},
 {id:'ren',name:'蓮',role:'高校生',icon:'🧑‍🎓',interests:['教育','環境','デジタル'],likes:['environment','life'],dislikes:[]},
 {id:'mina',name:'水城ミナ',role:'看護師',icon:'👩‍⚕️',interests:['福祉','防災'],likes:['life','safety'],dislikes:['budget']},
 {id:'goro',name:'剛田社長',role:'工業会代表',icon:'👷',interests:['経済','交通'],likes:['economy','budget'],dislikes:['environment']},
 {id:'yura',name:'ユラ',role:'地域インフルエンサー',icon:'🧑‍🎤',interests:['観光','デジタル'],likes:['support','economy'],dislikes:[]},
 {id:'shige',name:'重松議員',role:'議会古参',icon:'🧓',interests:['防災','福祉'],likes:['budget','safety'],dislikes:['environment']},
 {id:'sora',name:'空野ハル',role:'環境活動家',icon:'🧑‍🌾',interests:['環境','交通'],likes:['environment','life'],dislikes:['economy']}
];

export const CHAIN_EVENTS=[
 {id:'flood-after',title:'堤防延期の続報',icon:'🌧️',mood:'panic',body:'延期した区間で浸水が始まりました。住民から厳しい声が上がっています。',choices:[choice('repair','今すぐ緊急工事','高額でも被害拡大を防ぐ',{budget:-16,safety:12,support:2}),choice('evacuate','避難支援に集中','住民の安全を最優先',{budget:-8,safety:8,life:-2}),choice('explain','想定外と説明','責任を認めず乗り切る',{budget:-1,support:-12,safety:-4})]},
 {id:'factory-protest',title:'工場誘致への抗議活動',icon:'📣',mood:'worried',body:'周辺住民が交通量と排気への不安を訴え、市役所前に集まりました。',choices:[choice('rules','環境基準を追加','企業と再交渉する',{economy:-3,environment:7,support:5}),choice('dialogue','住民説明会を開催','対話で理解を求める',{budget:-2,support:4}),choice('proceed','計画を優先','雇用を理由に押し切る',{economy:5,environment:-5,support:-7})]},
 {id:'digital-gap',title:'オンライン化で窓口が混乱',icon:'🖥️',mood:'worried',body:'新システムに慣れない住民が窓口へ集中し、待ち時間が急増しています。',choices:[choice('support','支援員を増員','操作を丁寧に支援する',{budget:-5,life:6,support:4}),choice('rollback','一部を旧方式へ戻す','混乱を早く収める',{budget:-3,life:3,economy:-2}),choice('continue','慣れるまで待つ','改革を止めない',{economy:3,life:-5,support:-5})]},
 {id:'festival-noise',title:'祭りの騒音苦情',icon:'🔊',mood:'thinking',body:'盛り上がった一方、会場周辺から深夜の騒音について多数の苦情が届きました。',choices:[choice('curfew','終了時間を早める','来年からルールを見直す',{life:3,economy:-2,support:2}),choice('soundproof','防音設備を補助','祭りを維持しながら対策',{budget:-5,life:4}),choice('ignore','年1回なので容認','観光効果を優先',{economy:3,life:-4,support:-2})]},
 {id:'viral-backlash',title:'PR動画に「税金の無駄」の声',icon:'🔥',mood:'worried',body:'動画は再生されていますが、制作費が高すぎるという批判も拡散しています。',choices:[choice('publish','費用と効果を公開','透明性で信頼を取り戻す',{support:5}),choice('extra','追加広告を出す','成果で批判を打ち消す',{budget:-4,economy:4,support:-1}),choice('delete','動画を削除','炎上を止めるが投資は失われる',{economy:-4,support:-3})]}
];

export const DISTRICTS=[
 {id:'central',name:'中央',icon:'🏙️',description:'市役所と商店街が集まる中心地'},
 {id:'residential',name:'住宅',icon:'🏘️',description:'子育て世帯と高齢者が暮らす地区'},
 {id:'school',name:'学園',icon:'🎓',description:'学校・図書館・研究施設の地区'},
 {id:'industrial',name:'工業',icon:'🏭',description:'工場と物流拠点が集まる地区'},
 {id:'port',name:'港',icon:'⚓',description:'漁業と観光の玄関口'},
 {id:'river',name:'河川',icon:'🌊',description:'自然と防災を担う水辺地区'}
];
const districtIdByName={中央:'central',住宅:'residential',学園:'school',工業:'industrial',港:'port',河川:'river'};
export const districtId=name=>districtIdByName[name]||'central';
export const BUILDINGS=[
 {id:'market-hall',name:'市民市場',icon:'🏪',district:'central',cost:22,unlockDay:1,description:'経済と暮らしを毎日少し改善',daily:{economy:1,life:.4}},
 {id:'child-center',name:'子育て支援館',icon:'🧸',district:'residential',cost:26,unlockDay:3,description:'暮らしと支持率を底上げ',daily:{life:1,support:.3}},
 {id:'innovation-lab',name:'未来研究所',icon:'🔬',district:'school',cost:30,unlockDay:5,description:'経済と環境技術を育成',daily:{economy:.7,environment:.6}},
 {id:'eco-factory',name:'環境配慮工場',icon:'🏗️',district:'industrial',cost:34,unlockDay:7,description:'経済成長と環境負荷を両立',daily:{economy:1.2,environment:.2}},
 {id:'harbor-market',name:'港マルシェ',icon:'🐟',district:'port',cost:24,unlockDay:4,description:'観光収入と市民生活を改善',daily:{economy:.8,life:.4}},
 {id:'flood-park',name:'防災公園',icon:'🌳',district:'river',cost:28,unlockDay:2,description:'安心と環境を継続改善',daily:{safety:.9,environment:.5}},
 {id:'city-hall-annex',name:'市役所別館',icon:'🏛️',district:'central',cost:38,unlockDay:12,description:'議会運営と行政効率を強化',daily:{budget:.5,support:.3}},
 {id:'emergency-center',name:'防災指令センター',icon:'🚨',district:'river',cost:45,unlockDay:18,description:'災害への備えを大幅強化',daily:{safety:1.5,budget:-.2}}
];

export const SEASON={
 id:'season-1',name:'緑のまちづくり',endsAt:'2026-09-30',levels:[0,30,70,120,180,250,330,420,520,640],
 rewards:[{level:2,leaves:10},{level:3,cosmetic:'spring'},{level:5,leaves:20},{level:7,cosmetic:'night'},{level:10,cosmetic:'festival'}],
 missions:[{id:'decisions',label:'政策を30件判断',target:30,xp:80},{id:'incidents',label:'突発・続報へ8回答',target:8,xp:60},{id:'buildings',label:'施設を4件建設',target:4,xp:70},{id:'elections',label:'選挙で1回再選',target:1,xp:100}]
};
export const COSMETICS=[
 {id:'classic',name:'市役所ネイビー',icon:'👔',cost:0,className:'skin-classic'},
 {id:'spring',name:'若葉の制服',icon:'🌱',cost:40,className:'skin-spring'},
 {id:'night',name:'夜空の制服',icon:'🌙',cost:60,className:'skin-night'},
 {id:'festival',name:'お祭り法被',icon:'🏮',cost:75,className:'skin-festival'}
];

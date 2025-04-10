// === 全局作用域: 等待 DOM 加载完成 ===
document.addEventListener('DOMContentLoaded', () => {

    const MAX_HISTORY_ITEMS = 10; // 最大保存的历史记录条数
    const HISTORY_STORAGE_KEY = 'katakanaQuizHistory_v1'; // 本地存储的 Key

    // --- DOM 元素引用 ---
    // 将所有需要操作的 HTML 元素获取并存储在常量中，方便管理和提高性能
    const settingsArea = document.getElementById('settings-area');         // 设置区域 Div
    const timerDurationSelect = document.getElementById('timer-duration');   // 答题时间下拉框
    const nextModeRadios = document.querySelectorAll('input[name="next-mode"]'); // 切换模式单选按钮组
    const delayCorrectSelect = document.getElementById('delay-correct');     // 正确后延时下拉框
    const delayIncorrectSelect = document.getElementById('delay-incorrect'); // 错误后延时下拉框
    const levelSelectionDiv = document.getElementById('level-selection');   // 模式选择区域 Div
    const quizAreaDiv = document.getElementById('quiz-area');             // 测验区域 Div
    const resultAreaDiv = document.getElementById('result-area');           // 结果区域 Div
    const historyAreaDiv = document.getElementById('history-area');         // 历史记录区域 Div
    // !! 关键修复：选择器从 '.container' 改为 '.quiz-container' 以匹配 HTML
    const quizContainerDiv = document.querySelector('.quiz-container');     // 测验主容器 Div
    const questionDisplay = document.getElementById('question-display');   // 问题显示区域
    const wordInfoArea = document.getElementById('word-info-area');       // 词语信息显示区域 (中级模式)
    const optionsContainer = document.getElementById('options-container');   // 选项按钮容器
    const optionButtons = optionsContainer.querySelectorAll('.option-button'); // 所有选项按钮 (NodeList)
    const feedbackArea = document.getElementById('feedback-area');         // 正确/错误反馈信息区域
    const scoreDisplay = document.getElementById('score-display');         // 分数显示 (中级模式)
    const timerDisplay = document.getElementById('timer-display');         // 计时器显示
    const progressDisplay = document.getElementById('progress-display');     // 进度显示 (初级模式)
    const quizControlsDiv = document.getElementById('quiz-controls');       // 测验控制按钮区域 (下一题/结束)
    const nextQuestionButton = document.getElementById('next-question-button'); // 下一题按钮
    const stopQuizButton = document.getElementById('stop-quiz-button');     // 结束挑战按钮
    const finalScoreP = document.getElementById('final-score');           // 最终得分显示
    const totalQuestionsP = document.getElementById('total-questions');     // 总题数/完成情况显示
    const finalRatingP = document.getElementById('final-rating');         // 最终评级显示
    const historyListUl = document.getElementById('history-list');         // 历史记录列表 Ul
    const clearHistoryButton = historyAreaDiv.querySelector('.clear-btn'); // 清空历史按钮

    // --- Katakana 数据定义 ---
    // kr: Katakana Reading (假名, 平假名, 罗马音)
    function kr(katakana, hiragana, romaji) { return { katakana, hiragana, romaji }; }
    // kw: Katakana Word (假名, 平假名, 罗马音, 中文含义, 英文/来源)
    function kw(katakana, hiragana, romaji, meaning, english) { return { katakana, hiragana, romaji, meaning, english }; }

    // 基础片假名数据 (包括清音、浊音、半浊音、拗音、特殊音)
    const katakanaChars = [ kr('ア', 'あ', 'a'), kr('イ', 'い', 'i'), kr('ウ', 'う', 'u'), kr('エ', 'え', 'e'), kr('オ', 'お', 'o'), kr('カ', 'か', 'ka'), kr('キ', 'き', 'ki'), kr('ク', 'く', 'ku'), kr('ケ', 'け', 'ke'), kr('コ', 'こ', 'ko'), kr('サ', 'さ', 'sa'), kr('シ', 'し', 'shi'), kr('ス', 'す', 'su'), kr('セ', 'せ', 'se'), kr('ソ', 'そ', 'so'), kr('タ', 'た', 'ta'), kr('チ', 'ち', 'chi'), kr('ツ', 'つ', 'tsu'), kr('テ', 'て', 'te'), kr('ト', 'と', 'to'), kr('ナ', 'な', 'na'), kr('ニ', 'に', 'ni'), kr('ヌ', 'ぬ', 'nu'), kr('ネ', 'ね', 'ne'), kr('ノ', 'の', 'no'), kr('ハ', 'は', 'ha'), kr('ヒ', 'ひ', 'hi'), kr('フ', 'ふ', 'fu'), kr('ヘ', 'へ', 'he'), kr('ホ', 'ほ', 'ho'), kr('マ', 'ま', 'ma'), kr('ミ', 'み', 'mi'), kr('ム', 'む', 'mu'), kr('メ', 'め', 'me'), kr('モ', 'も', 'mo'), kr('ヤ', 'や', 'ya'), kr('ユ', 'ゆ', 'yu'), kr('ヨ', 'よ', 'yo'), kr('ラ', 'ら', 'ra'), kr('リ', 'り', 'ri'), kr('ル', 'る', 'ru'), kr('レ', 'れ', 're'), kr('ロ', 'ろ', 'ro'), kr('ワ', 'わ', 'wa'), kr('ヲ', 'を', 'wo'), kr('ン', 'ん', 'n'), kr('ガ', 'が', 'ga'), kr('ギ', 'ぎ', 'gi'), kr('グ', 'ぐ', 'gu'), kr('ゲ', 'げ', 'ge'), kr('ゴ', 'ご', 'go'), kr('ザ', 'ざ', 'za'), kr('ジ', 'じ', 'ji'), kr('ズ', 'ず', 'zu'), kr('ゼ', 'ぜ', 'ze'), kr('ゾ', 'ぞ', 'zo'), kr('ダ', 'だ', 'da'), kr('ヂ', 'ぢ', 'ji'), kr('ヅ', 'づ', 'zu'), kr('デ', 'で', 'de'), kr('ド', 'ど', 'do'), kr('バ', 'ば', 'ba'), kr('ビ', 'び', 'bi'), kr('ブ', 'ぶ', 'bu'), kr('ベ', 'べ', 'be'), kr('ボ', 'ぼ', 'bo'), kr('パ', 'ぱ', 'pa'), kr('ピ', 'ぴ', 'pi'), kr('プ', 'ぷ', 'pu'), kr('ペ', 'ぺ', 'pe'), kr('ポ', 'ぽ', 'po'), kr('キャ', 'きゃ', 'kya'), kr('キュ', 'きゅ', 'kyu'), kr('キョ', 'きょ', 'kyo'), kr('シャ', 'しゃ', 'sha'), kr('シュ', 'しゅ', 'shu'), kr('ショ', 'しょ', 'sho'), kr('チャ', 'ちゃ', 'cha'), kr('チュ', 'ちゅ', 'chu'), kr('チョ', 'ちょ', 'cho'), kr('ニャ', 'にゃ', 'nya'), kr('ニュ', 'にゅ', 'nyu'), kr('ニョ', 'にょ', 'nyo'), kr('ヒャ', 'ひゃ', 'hya'), kr('ヒュ', 'ひゅ', 'hyu'), kr('ヒョ', 'ひょ', 'hyo'), kr('ミャ', 'みゃ', 'mya'), kr('ミュ', 'みゅ', 'myu'), kr('ミョ', 'みょ', 'myo'), kr('リャ', 'りゃ', 'rya'), kr('リュ', 'りゅ', 'ryu'), kr('リョ', 'りょ', 'ryo'), kr('ギャ', 'ぎゃ', 'gya'), kr('ギュ', 'ぎゅ', 'gyu'), kr('ギョ', 'ぎょ', 'gyo'), kr('ジャ', 'じゃ', 'ja'), kr('ジュ', 'じゅ', 'ju'), kr('ジョ', 'じょ', 'jo'), kr('ヂャ', 'ぢゃ', 'ja'), kr('ヂュ', 'ぢゅ', 'ju'), kr('ヂョ', 'ぢょ', 'jo'), kr('ビャ', 'びゃ', 'bya'), kr('ビュ', 'びゅ', 'byu'), kr('ビョ', 'びょ', 'byo'), kr('ピャ', 'ぴゃ', 'pya'), kr('ピュ', 'ぴゅ', 'pyu'), kr('ピョ', 'ぴょ', 'pyo'), kr('ヴァ', 'ゔぁ', 'va'), kr('ヴィ', 'ゔぃ', 'vi'), kr('ヴ', 'ゔ', 'vu'), kr('ヴェ', 'ゔぇ', 've'), kr('ヴォ', 'ゔぉ', 'vo'), kr('シェ', 'しぇ', 'she'), kr('ジェ', 'じぇ', 'je'), kr('チェ', 'ちぇ', 'che'), kr('ティ', 'てぃ', 'ti'), kr('トゥ', 'とぅ', 'tu'), kr('テュ', 'てゅ', 'tyu'), kr('ディ', 'でぃ', 'di'), kr('ドゥ', 'どぅ', 'du'), kr('デュ', 'でゅ', 'dyu'), kr('ファ', 'ふぁ', 'fa'), kr('フィ', 'ふぃ', 'fi'), kr('フェ', 'ふぇ', 'fe'), kr('フォ', 'ふぉ', 'fo'), kr('フュ', 'ふゅ', 'fyu'), kr('ウィ', 'うぃ', 'wi'), kr('ウェ', 'うぇ', 'we'), kr('ウォ', 'うぉ', 'wo'), kr('ツァ', 'つぁ', 'tsa'), kr('ツィ', 'つぃ', 'tsi'), kr('ツェ', 'つぇ', 'tse'), kr('ツォ', 'つぉ', 'tso'), kr('イェ', 'いぇ', 'ye'), ];

    // 常用片假名词汇数据
    const katakanaWords = [ kw('コーヒー', 'こーひー', 'kōhī', '咖啡', 'Coffee'), kw('ジュース', 'じゅーす', 'jūsu', '果汁', 'Juice'), kw('ビール', 'びーる', 'bīru', '啤酒', 'Beer'), kw('ワイン', 'わいん', 'wain', '葡萄酒', 'Wine'), kw('パン', 'ぱん', 'pan', '面包', 'Bread (from Portuguese: pão)'), kw('チーズ', 'ちーず', 'chīzu', '奶酪/芝士', 'Cheese'), kw('ケーキ', 'けーき', 'kēki', '蛋糕', 'Cake'), kw('チョコレート', 'ちょこれーと', 'chokorēto', '巧克力', 'Chocolate'), kw('アイスクリーム', 'あいすくりーむ', 'aisu kurīmu', '冰淇淋', 'Ice cream'), kw('サラダ', 'さらだ', 'sarada', '沙拉', 'Salad'), kw('スープ', 'すーぷ', 'sūpu', '汤', 'Soup'), kw('ステーキ', 'すてーき', 'sutēki', '牛排', 'Steak'), kw('ハンバーガー', 'はんばーがー', 'hanbāgā', '汉堡包', 'Hamburger'), kw('サンドイッチ', 'さんどいっち', 'sandoitchi', '三明治', 'Sandwich'), kw('ピザ', 'ぴざ', 'piza', '披萨', 'Pizza'), kw('パスタ', 'ぱすた', 'pasuta', '意大利面', 'Pasta'), kw('ラーメン', 'らーめん', 'rāmen', '拉面', '(from Chinese 拉面)'), kw('カレー', 'かれー', 'karē', '咖喱', 'Curry'), kw('ヨーグルト', 'よーぐると', 'yōguruto', '酸奶', 'Yogurt'), kw('トースト', 'とーすと', 'tōsuto', '烤面包片', 'Toast'), kw('ソーセージ', 'そーせーじ', 'sōsēji', '香肠', 'Sausage'), kw('デザート', 'でざーと', 'dezāto', '甜点', 'Dessert'), kw('ミルク', 'みるく', 'miruku', '牛奶', 'Milk'), kw('ティー', 'てぃー', 'tī', '茶 (特指红茶等)', 'Tea'), kw('テレビ', 'てれび', 'terebi', '电视', 'Television'), kw('ラジオ', 'らじお', 'rajio', '收音机', 'Radio'), kw('パソコン', 'ぱそこん', 'pasokon', '个人电脑', 'Personal computer'), kw('スマホ', 'すまほ', 'sumaho', '智能手机', 'Smartphone'), kw('タブレット', 'たぶれっと', 'taburetto', '平板电脑', 'Tablet'), kw('カメラ', 'かめら', 'kamera', '相机', 'Camera'), kw('インターネット', 'いんたーねっと', 'intānetto', '互联网', 'Internet'), kw('メール', 'めーる', 'mēru', '邮件', 'Mail (E-mail)'), kw('ウェブサイト', 'うぇぶさいと', 'webusaito', '网站', 'Website'), kw('アプリ', 'あぷり', 'apuri', '应用程序', 'Application (App)'), kw('ゲーム', 'げーむ', 'gēmu', '游戏', 'Game'), kw('キーボード', 'きーぼーど', 'kībōdo', '键盘', 'Keyboard'), kw('マウス', 'まうす', 'mausu', '鼠标', 'Mouse'), kw('プリンター', 'ぷりんたー', 'purintā', '打印机', 'Printer'), kw('バッテリー', 'ばってりー', 'batterī', '电池', 'Battery'), kw('エアコン', 'えあこん', 'eakon', '空调', 'Air conditioner'), kw('ロボット', 'ろぼっと', 'robotto', '机器人', 'Robot'), kw('ウイルス', 'ういるす', 'uirusu', '病毒', 'Virus'), kw('プログラム', 'ぷろぐらむ', 'puroguramu', '程序', 'Program'), kw('ホテル', 'ほてる', 'hoteru', '酒店', 'Hotel'), kw('レストラン', 'れすとらん', 'resutoran', '餐厅', 'Restaurant'), kw('スーパー', 'すーぱー', 'sūpā', '超市', 'Supermarket'), kw('デパート', 'でぱーと', 'depāto', '百货商店', 'Department store'), kw('コンビニ', 'こんびに', 'konbini', '便利店', 'Convenience store'), kw('タクシー', 'たくしー', 'takushī', '出租车', 'Taxi'), kw('バス', 'ばす', 'basu', '公交车', 'Bus'), kw('エレベーター', 'えれべーたー', 'erebētā', '电梯', 'Elevator'), kw('エスカレーター', 'えすかれーたー', 'esukarētā', '自动扶梯', 'Escalator'), kw('トイレ', 'といれ', 'toire', '厕所/卫生间', 'Toilet'), kw('アパート', 'あぱーと', 'apāto', '公寓', 'Apartment'), kw('マンション', 'まんしょん', 'manshon', '高级公寓', 'Mansion (condominium)'), kw('ビル', 'びる', 'biru', '大楼', 'Building'), kw('フロント', 'ふろんと', 'furonto', '前台', 'Front desk'), kw('ロビー', 'ろびー', 'robī', '大厅', 'Lobby'), kw('ホーム', 'ほーむ', 'hōmu', '站台', 'Platform (Train station)'), kw('ガソリンスタンド', 'がそりんすたんど', 'gasorin sutando', '加油站', 'Gasoline stand'), kw('スポーツ', 'すぽーつ', 'supōtsu', '体育运动', 'Sports'), kw('サッカー', 'さっかー', 'sakkā', '足球', 'Soccer'), kw('バスケットボール', 'ばすけっとぼーる', 'basuketto bōru', '篮球', 'Basketball'), kw('テニス', 'てにす', 'tenisu', '网球', 'Tennis'), kw('ゴルフ', 'ごるふ', 'gorufu', '高尔夫', 'Golf'), kw('スキー', 'すきー', 'sukī', '滑雪', 'Skiing'), kw('スケート', 'すけーと', 'sukēto', '滑冰', 'Skating'), kw('ジョギング', 'じょぎんぐ', 'jogingu', '慢跑', 'Jogging'), kw('ダンス', 'だんす', 'dansu', '舞蹈', 'Dance'), kw('ピアノ', 'ぴあの', 'piano', '钢琴', 'Piano'), kw('ギター', 'ぎたー', 'gitā', '吉他', 'Guitar'), kw('アニメ', 'あにめ', 'anime', '动画', 'Animation'), kw('マンガ', 'まんが', 'manga', '漫画', '(from Japanese 漫画)'), kw('カラオケ', 'からおけ', 'karaoke', '卡拉OK', 'Karaoke'), kw('コンサート', 'こんさーと', 'konsāto', '音乐会', 'Concert'), kw('シャツ', 'しゃつ', 'shatsu', '衬衫', 'Shirt'), kw('スカート', 'すかーと', 'sukāto', '裙子', 'Skirt'), kw('ズボン', 'ずぼん', 'zubon', '裤子', 'Trousers (from French: jupon)'), kw('ネクタイ', 'ねくたい', 'nekutai', '领带', 'Necktie'), kw('コート', 'こーと', 'kōto', '外套/大衣', 'Coat'), kw('セーター', 'せーたー', 'sētā', '毛衣', 'Sweater'), kw('ワンピース', 'わんぴーす', 'wanpīsu', '连衣裙', 'One-piece dress'), kw('ドア', 'どあ', 'doa', '门', 'Door'), kw('テーブル', 'てーぶる', 'tēburu', '桌子', 'Table'), kw('イス', 'いす', 'isu', '椅子', 'Chair (often used)'), kw('ベッド', 'べっど', 'beddo', '床', 'Bed'), kw('ソファ', 'そふぁ', 'sofa', '沙发', 'Sofa'), kw('シャワー', 'しゃわー', 'shawā', '淋浴', 'Shower'), kw('カレンダー', 'かれんだー', 'karendā', '日历', 'Calendar'), kw('ノート', 'のーと', 'nōto', '笔记本', 'Notebook'), kw('ペン', 'ぺん', 'pen', '笔', 'Pen'), kw('ガラス', 'がらす', 'garasu', '玻璃', 'Glass'), kw('プラスチック', 'ぷらすちっく', 'purasuchikku', '塑料', 'Plastic'), kw('タオル', 'たおる', 'taoru', '毛巾', 'Towel'), kw('マスク', 'ますく', 'masuku', '口罩', 'Mask'), kw('ハンカチ', 'はんかち', 'hankachi', '手帕', 'Handkerchief'), kw('クラス', 'くらす', 'kurasu', '班级/等级', 'Class'), kw('グループ', 'ぐるーぷ', 'gurūpu', '小组/团体', 'Group'), kw('チーム', 'ちーむ', 'chīmu', '队伍/团队', 'Team'), kw('アルバイト', 'あるばいと', 'arubaito', '打工/兼职', 'Part-time job (from German: Arbeit)'), kw('サラリーマン', 'さらりーまん', 'sararīman', '工薪族/上班族', 'Salaryman'), kw('ビジネス', 'びじねす', 'bijinesu', '商业/业务', 'Business'), kw('ミーティング', 'みーてぃんぐ', 'mītingu', '会议', 'Meeting'), kw('プロジェクト', 'ぷろじぇくと', 'purojekuto', '项目', 'Project'), kw('デザイン', 'でざいん', 'dezain', '设计', 'Design'), kw('システム', 'しすてむ', 'shisutemu', '系统', 'System'), kw('データ', 'でーた', 'dēta', '数据', 'Data'), kw('サービス', 'さーびす', 'sābisu', '服务', 'Service'), kw('ストレス', 'すとれす', 'sutoresu', '压力', 'Stress'), kw('イメージ', 'いめーじ', 'imēji', '印象/图像', 'Image'), kw('アイデア', 'あいであ', 'aidea', '想法/主意', 'Idea'), kw('ポイント', 'ぽいんと', 'pointo', '要点/分数', 'Point'), kw('チャンス', 'ちゃんす', 'chansu', '机会', 'Chance'), kw('タイミング', 'たいみんぐ', 'taimingu', '时机', 'Timing'), kw('バランス', 'ばらんす', 'baransu', '平衡', 'Balance'), kw('コミュニケーション', 'こみゅにけーしょん', 'komyunikēshon', '交流/沟通', 'Communication'), kw('エネルギー', 'えねるぎー', 'enerugī', '能源/能量', 'Energy'), kw('パーセント', 'ぱーせんと', 'pāsento', '百分比', 'Percent'), kw('シンプル', 'しんぷる', 'shinpuru', '简单', 'Simple'), kw('スマート', 'すまーと', 'sumāto', '聪明的/时髦的', 'Smart'), kw('サイズ', 'さいず', 'saizu', '尺寸/大小', 'Size'), kw('メモ', 'めも', 'memo', '笔记/备忘录', 'Memo'), kw('ルール', 'るーる', 'rūru', '规则', 'Rule'), kw('マナー', 'まなー', 'manā', '礼仪', 'Manner'), kw('ニュース', 'にゅーす', 'nyūsu', '新闻', 'News'), kw('テーマ', 'てーま', 'tēma', '主题', 'Theme'), kw('レベル', 'れべる', 'reberu', '水平/等级', 'Level'), kw('アメリカ', 'あめりか', 'amerika', '美国', 'America'), kw('イギリス', 'いぎりす', 'igirisu', '英国', 'England (historically, now UK)'), kw('フランス', 'ふらんす', 'furansu', '法国', 'France'), kw('ドイツ', 'どいつ', 'doitsu', '德国', 'Germany (from Dutch: Duits)'), kw('アジア', 'あじあ', 'ajia', '亚洲', 'Asia'), kw('ヨーロッパ', 'よーろっぱ', 'yōroppa', '欧洲', 'Europe'), kw('アフリカ', 'あふりか', 'afurika', '非洲', 'Africa'), kw('カナダ', 'かなだ', 'kanada', '加拿大', 'Canada'), kw('オーストラリア', 'おーすとらりあ', 'ōsutoraria', '澳大利亚', 'Australia'), kw('ピンク', 'ぴんく', 'pinku', '粉色', 'Pink'), kw('オレンジ', 'おれんじ', 'orenji', '橙色', 'Orange'), kw('グレー', 'ぐれー', 'gurē', '灰色', 'Gray/Grey'), kw('シルバー', 'しるばー', 'shirubā', '银色', 'Silver'), kw('ゴールド', 'ごーるど', 'gōrudo', '金色', 'Gold'), kw('ブルー', 'ぶるー', 'burū', '蓝色', 'Blue'), kw('グリーン', 'ぐりーん', 'gurīn', '绿色', 'Green'), kw('レッド', 'れっど', 'reddo', '红色', 'Red'), kw('イエロー', 'いえろー', 'ierō', '黄色', 'Yellow'), kw('ホワイト', 'ほわいと', 'howaito', '白色', 'White'), kw('ブラック', 'ぶらっく', 'burakku', '黑色', 'Black'), ];

    // --- 游戏状态变量 ---
    let currentLevel = null;            // 当前游戏模式 ('beginner' 或 'intermediate')
    let currentQuestions = [];          // 当前模式下的问题列表 (洗牌后)
    let currentQuestionIndex = 0;       // 当前问题的索引 (中级模式用)
    let score = 0;                      // 当前得分 (中级模式用)
    let timerId = null;                 // 定时器 ID，用于清除定时器
    let timeLeft = 0;                   // 当前问题剩余时间 (秒)
    let gameTimeLimit = 5;              // 每个问题的答题时限 (秒)，从设置读取
    let autoNextMode = true;            // 是否自动进入下一题，从设置读取
    let autoDelayCorrect = 2000;        // 答对后自动进入下一题的延迟 (毫秒)，从设置读取
    let autoDelayIncorrect = 4000;      // 答错后自动进入下一题的延迟 (毫秒)，从设置读取
    let correctAnswerData = null;       // 当前问题的正确答案数据对象
    let questionsAnsweredInBeginner = new Set(); // 初级模式下已回答过的问题 (存储片假名)，用于确保不重复
    let totalBeginnerQuestions = katakanaChars.length; // 初级模式的总问题数
    let isAnswered = false;             // 当前问题是否已被回答 (防止重复处理)
    let quizStoppedManually = false;    // 测验是否被用户手动中止
    let questionStartTime = 0;          // 当前问题开始的时间戳 (毫秒)，用于计算回答时间
    let correctAnswerTimes = [];        // 存储每次正确回答所用时间的数组 (秒)，用于计算平均时间

    // --- 辅助数据结构 ---
    // 创建一个 平假名 -> 罗马音 的映射，方便查找
    const hiraganaRomajiMap = new Map();
    katakanaChars.forEach(item => hiraganaRomajiMap.set(item.hiragana, item.romaji));
    katakanaWords.forEach(item => hiraganaRomajiMap.set(item.hiragana, item.romaji));

    // 用于生成干扰项的基础平假名字符集和映射
    const basicHiraganaChars = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんがぎぐげござじずぜぞだぢづでどばびぶべぼぱぴぷぺぽ";
    const dakutenMap = {'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご','さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ','た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど','は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ'};
    const handakutenMap = {'は':'ぱ','ひ':'ぴ','ふ':'ぷ','へ':'ぺ','ほ':'ぽ'};
    // 自动创建反向映射 (浊音/半浊音 -> 清音)
    const inverseDakutenMap = Object.entries(dakutenMap).reduce((acc, [key, val]) => { acc[val] = key; return acc; }, {});
    const inverseHandakutenMap = Object.entries(handakutenMap).reduce((acc, [key, val]) => { acc[val] = key; return acc; }, {});

    // --- 初始化 ---
    // 页面加载完成后，加载历史记录并显示模式选择界面
    loadHistory();
    showLevelSelection();

      // --- 为页面上的静态按钮安全地绑定事件监听器 ---

    // 模式选择按钮
    if (levelSelectionDiv) {
        const levelButtons = levelSelectionDiv.querySelectorAll('button'); // 获取模式选择区域内所有的按钮
        if (levelButtons.length >= 2) { // 确保至少有两个按钮
            // 第一个按钮 (初级)
            levelButtons[0].onclick = () => startGame('beginner');
            console.log("初级按钮事件已绑定"); // 添加日志确认绑定

            // 第二个按钮 (中级)
            levelButtons[1].onclick = () => startGame('intermediate');
            console.log("中级按钮事件已绑定"); // 添加日志确认绑定
        } else {
            console.error("错误：在 #level-selection 中未能找到足够的模式选择按钮（需要至少2个）！");
        }
    } else {
        console.error("错误：未能找到模式选择区域 #level-selection！");
    }

    // 下一题按钮
    if (nextQuestionButton) {
        nextQuestionButton.onclick = loadQuestion;
    } else {
        console.warn("未能找到 '下一题' 按钮 (#next-question-button)");
    }

    // 结束挑战按钮
    if (stopQuizButton) {
        stopQuizButton.onclick = stopQuiz;
    } else {
        console.warn("未能找到 '结束挑战' 按钮 (#stop-quiz-button)");
    }

    // 再玩一次按钮
    const resultButton = resultAreaDiv ? resultAreaDiv.querySelector('button') : null;
    if (resultButton) {
        resultButton.onclick = showLevelSelection;
    } else {
        // 这个警告是正常的，因为结果区域初始是隐藏的，按钮可能不存在于DOM中
        // console.info("信息：页面加载时未找到 '再玩一次' 按钮 (结果区域初始隐藏)");
    }

    // 清空历史按钮
    if (clearHistoryButton) {
        clearHistoryButton.onclick = clearHistory;
    } else {
        console.warn("未能找到 '清空历史' 按钮 (.clear-btn in #history-area)");
    }

    // 注意：startGame, loadQuestion, showLevelSelection, stopQuiz, clearHistory 这些函数需要已定义


    // --- 核心功能函数 ---

    /**
     * @description 洗牌函数：随机打乱数组元素的顺序 (Fisher-Yates Algorithm)
     * @param {Array} array 需要打乱的数组
     * @returns {Array} 打乱顺序后的原数组
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // ES6 解构赋值交换元素
        }
        return array;
    }

    /**
     * @description 开始测验
     * @param {string} level 选择的模式 ('beginner' 或 'intermediate')
     */
    function startGame(level) {
        // 1. 读取并应用设置
        gameTimeLimit = parseInt(timerDurationSelect.value) || 5;
        const nextModeSetting = document.querySelector('input[name="next-mode"]:checked');
        autoNextMode = nextModeSetting ? nextModeSetting.value === 'auto' : true; // 默认为自动
        autoDelayCorrect = (parseFloat(delayCorrectSelect.value) || 2) * 1000; // 默认 2 秒
        autoDelayIncorrect = (parseFloat(delayIncorrectSelect.value) || 4) * 1000; // 默认 4 秒

        // 2. 重置游戏状态
        currentLevel = level;
        score = 0;
        currentQuestionIndex = 0;
        isAnswered = false;
        quizStoppedManually = false;
        feedbackArea.textContent = ''; // 清空反馈信息
        feedbackArea.className = '';   // 移除反馈样式
        questionsAnsweredInBeginner.clear(); // 清空初级模式已答题目集合
        wordInfoArea.innerHTML = '';         // 清空词语信息区域
        wordInfoArea.classList.add('hidden'); // 隐藏词语信息区域
        correctAnswerTimes = [];             // 清空正确回答时间记录

        // 3. 更新 UI 元素可见性与样式
        if (!quizContainerDiv) {
            console.error("错误：未能找到 .quiz-container 元素！脚本无法继续。");
            alert("页面初始化失败，请检查控制台错误信息。");
            return; // 停止执行
        }
        quizContainerDiv.classList.remove('level-beginner', 'level-intermediate'); // 清除旧模式类
        quizContainerDiv.classList.add(`level-${level}`); // 添加当前模式类

        // 根据模式准备问题列表并更新对应 UI
        if (level === 'beginner') {
            currentQuestions = shuffleArray([...katakanaChars]); // 复制并打乱假名数组
            progressDisplay.classList.remove('hidden'); // 显示进度
            scoreDisplay.classList.add('hidden');       // 隐藏分数
        } else { // intermediate
            currentQuestions = shuffleArray([...katakanaWords]); // 复制并打乱词语数组
            scoreDisplay.textContent = `分数: ${score}`;    // 初始化分数显示
            scoreDisplay.classList.remove('hidden');      // 显示分数
            progressDisplay.classList.add('hidden');        // 隐藏进度
        }

        timerDisplay.classList.remove('hidden');      // 显示计时器
        settingsArea.classList.add('hidden');         // 隐藏设置区域
        levelSelectionDiv.classList.add('hidden');    // 隐藏模式选择区域
        resultAreaDiv.classList.add('hidden');        // 隐藏结果区域
        finalRatingP.classList.add('hidden');         // 隐藏最终评级
        historyAreaDiv.classList.add('hidden');       // 暂时隐藏历史区域 (测验结束后显示)
        quizAreaDiv.classList.remove('hidden');       // 显示测验区域
        nextQuestionButton.classList.add('hidden');   // 隐藏 "下一题" 按钮 (自动模式或开始时)
        stopQuizButton.classList.remove('hidden');    // 显示 "结束挑战" 按钮
        stopQuizButton.disabled = false;              // 启用 "结束挑战" 按钮

        // 4. 加载第一题
        loadQuestion();
    }

    /**
     * @description 加载并显示下一个问题
     */
    function loadQuestion() {
        // 如果测验被手动停止，则不再加载新问题
        if (quizStoppedManually) return;

        // 重置状态和 UI
        isAnswered = false;
        resetOptionButtons(); // 重置选项按钮样式和状态
        nextQuestionButton.classList.add('hidden'); // 隐藏 "下一题" 按钮
        stopQuizButton.disabled = false;          // 启用 "结束挑战" 按钮
        feedbackArea.textContent = '';          // 清空上一题的反馈
        feedbackArea.className = '';              // 移除反馈样式

        // 检查测验是否完成
        if (checkQuizCompletion()) {
            endQuiz(); // 如果完成，则结束测验
            return;
        }

        // 获取下一个问题的数据
        correctAnswerData = getNextQuestionData();
        // 如果无法获取下一个问题 (例如初级模式已答完所有)，则结束测验
        if (!correctAnswerData) {
            console.log("无法获取下一题，测验结束。");
            endQuiz();
            return;
        }

        // 显示问题 (片假名)
        questionDisplay.textContent = correctAnswerData.katakana;

        // 生成包含正确答案和干扰项的选项
        const options = generateOptions(correctAnswerData, currentLevel);
        // 打乱选项顺序
        const shuffledOptions = shuffleArray(options);

        // 将选项填充到按钮上，并绑定点击事件
        optionButtons.forEach((button, index) => {
            if (index < shuffledOptions.length) {
                const hiragana = shuffledOptions[index];
                const romaji = hiraganaRomajiMap.get(hiragana) || '?'; // 获取罗马音，找不到则显示 '?'

                // 设置按钮文本
                button.querySelector('.hiragana-text').textContent = hiragana;
                button.querySelector('.romaji-text').textContent = romaji;

                // 移除旧的点击事件监听器 (如果存在)
                button.onclick = null;
                // 添加新的点击事件监听器
                button.onclick = () => selectAnswer(button);

                // 启用按钮
                button.disabled = false;
                button.classList.remove('hidden'); // 确保按钮可见
            } else {
                // 如果选项少于按钮数，隐藏多余的按钮
                button.classList.add('hidden');
                button.onclick = null;
                button.disabled = true;
            }
        });

        // 更新初级模式的进度显示
        if (currentLevel === 'beginner') {
            progressDisplay.textContent = `进度: ${questionsAnsweredInBeginner.size + 1} / ${totalBeginnerQuestions}`;
        }

        // 记录问题开始时间并启动计时器
        questionStartTime = Date.now();
        startTimer();
    }

    /**
     * @description 获取下一个问题的数据 (区分初级和中级模式)
     * @returns {object | null} 问题数据对象，如果无可用问题则返回 null
     */
    function getNextQuestionData() {
        if (currentLevel === 'beginner') {
            // 初级模式：找到题库中第一个尚未回答过的问题
            if (questionsAnsweredInBeginner.size >= totalBeginnerQuestions) {
                return null; // 所有问题都已回答
            }
            let attempts = 0; // 防止无限循环 (虽然理论上不应该发生)
            // 循环查找，直到找到一个未被回答的问题
            while (attempts < currentQuestions.length * 2) {
                let potentialQuestion = currentQuestions[currentQuestionIndex % currentQuestions.length];
                // 检查 Set 中是否已有该问题的片假名
                if (!questionsAnsweredInBeginner.has(potentialQuestion.katakana)) {
                    questionsAnsweredInBeginner.add(potentialQuestion.katakana); // 标记为已回答
                    // 注意：这里不递增 currentQuestionIndex，因为下次查找需要从头开始扫描
                    return potentialQuestion; // 返回找到的问题
                }
                currentQuestionIndex++; // 继续查找下一个
                attempts++;
            }
            console.warn("初级模式：在多次尝试后未能找到未回答的问题。");
            return null; // 理论上不应到达这里，但作为保险
        } else { // intermediate
            // 中级模式：按顺序获取问题
            if (currentQuestionIndex >= currentQuestions.length) {
                return null; // 题库已结束
            }
            const questionData = currentQuestions[currentQuestionIndex];
            currentQuestionIndex++; // 移动到下一个问题的索引
            return questionData;
        }
    }

    /**
     * @description 检查测验是否已经完成所有问题
     * @returns {boolean} 如果完成返回 true，否则返回 false
     */
    function checkQuizCompletion() {
        if (currentLevel === 'beginner') {
            // 初级模式：检查已回答问题数量是否达到总数
            return questionsAnsweredInBeginner.size >= totalBeginnerQuestions;
        } else { // intermediate
            // 中级模式：检查当前索引是否超出问题列表长度
            return currentQuestionIndex >= currentQuestions.length;
        }
    }


    /**
     * @description 生成与给定平假名相似的干扰项 (用于选项)
     * @param {string} original - 正确答案的平假名
     * @param {string[]} existingOptions - 当前已有的选项，避免生成重复
     * @returns {string | null} 一个相似但不同的平假名字符串，如果无法生成则返回 null
     */
    function generateSimilarHiragana(original, existingOptions) {
        const chars = Array.from(original); // 支持处理拗音等组合假名
        if (chars.length === 0) return null; // 空字符串无法处理

        const maxAttempts = 20; // 设定最大尝试次数，防止无限循环

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // 随机选择一个字符进行修改
            const indexToChange = Math.floor(Math.random() * chars.length);
            const originalChar = chars[indexToChange];
            let modifiedChar = originalChar;
            let modifiedString = '';

            // 随机决定修改类型
            const changeType = Math.random();

            if (changeType < 0.5 || chars.length === 1) { // 50% 概率：替换字符 (单字符时强制替换)
                let tries = 0;
                do {
                    // 从基础平假名集中随机选一个
                    modifiedChar = basicHiraganaChars[Math.floor(Math.random() * basicHiraganaChars.length)];
                    tries++;
                } while (modifiedChar === originalChar && tries < 50); // 确保与原字符不同
            } else if (changeType < 0.8) { // 30% 概率：添加/移除浊音/半浊音
                if (inverseDakutenMap[originalChar]) { // 如果是浊音
                    modifiedChar = inverseDakutenMap[originalChar]; // 变清音
                } else if (inverseHandakutenMap[originalChar]) { // 如果是半浊音
                    modifiedChar = inverseHandakutenMap[originalChar]; // 变清音
                } else if (dakutenMap[originalChar]) { // 如果是可加浊音的清音
                    modifiedChar = dakutenMap[originalChar]; // 加浊音
                } else if (handakutenMap[originalChar]) { // 如果是可加半浊音的清音
                    modifiedChar = handakutenMap[originalChar]; // 加半浊音
                }
                // 如果该字符无法进行浊音/半浊音变换，则此次尝试失败，进入下一次循环
                if (modifiedChar === originalChar) continue;
            } else { // 20% 概率：修改元音或长音 (简化处理)
                 // 简化处理：尝试替换为另一个基础元音
                 const vowels = ['あ', 'い', 'う', 'え', 'お'];
                 let currentVowelIndex = -1;
                 // 查找当前字符是否是或对应哪个元音 (极简映射)
                 const simpleVowelMap = {'あ':'あ','か':'あ','さ':'あ','た':'あ','な':'あ','は':'あ','ま':'あ','や':'あ','ら':'あ','わ':'あ','が':'あ','ざ':'あ','だ':'あ','ば':'あ','ぱ':'あ', 'い':'い','き':'い','し':'い','ち':'い','に':'い','ひ':'い','み':'い','り':'い','ゐ':'い','ぎ':'い','じ':'い','ぢ':'い','び':'い','ぴ':'い', 'う':'う','く':'う','す':'う','つ':'う','ぬ':'う','ふ':'う','む':'う','ゆ':'う','る':'う','ぐ':'う','ず':'う','づ':'う','ぶ':'う','ぷ':'う', 'え':'え','け':'え','せ':'え','て':'え','ね':'え','へ':'え','め':'え','れ':'え','ゑ':'え','げ':'え','ぜ':'え','で':'え','べ':'え','ぺ':'え', 'お':'お','こ':'お','そ':'お','と':'お','の':'お','ほ':'お','も':'お','よ':'お','ろ':'お','を':'お','ご':'お','ぞ':'お','ど':'お','ぼ':'お','ぽ':'お'};
                 const mappedVowel = simpleVowelMap[originalChar];
                 if(mappedVowel){
                     currentVowelIndex = vowels.indexOf(mappedVowel);
                 }

                 if(currentVowelIndex !== -1){
                     let newVowelIndex;
                     do {
                         newVowelIndex = Math.floor(Math.random() * vowels.length);
                     } while (newVowelIndex === currentVowelIndex); // 确保是不同的元音
                     modifiedChar = vowels[newVowelIndex];
                 } else if (originalChar === 'ー' && indexToChange > 0) {
                     // 如果是长音符，尝试移除它
                     chars.splice(indexToChange, 1); // 直接在原数组上删除
                     modifiedString = chars.join('');
                     // 检查修改后的字符串是否有效且不重复
                     if (modifiedString && modifiedString !== original && !existingOptions.includes(modifiedString)) {
                           return modifiedString; // 直接返回修改后的字符串
                     }
                     continue; // 如果移除长音无效或重复，则尝试其他修改
                 } else {
                     // 其他情况（如拗音、ん）无法简单处理元音，此次尝试失败
                     continue;
                 }
            }

            // 如果是通过修改字符得到的，构建新的字符串
            if (!modifiedString) {
                 const newChars = [...chars]; // 复制原字符数组
                 newChars[indexToChange] = modifiedChar; // 替换选定的字符
                 modifiedString = newChars.join(''); // 组合成新字符串
            }

            // 检查生成的字符串是否有效（非空）、与原字符串不同、且不在已有选项中
            if (modifiedString && modifiedString !== original && !existingOptions.includes(modifiedString)) {
                return modifiedString; // 成功生成一个有效的、唯一的相似干扰项
            }
        } // 结束尝试循环

        // 如果多次尝试都失败了，返回 null
        console.warn(`无法为 "${original}" 生成独特的相似干扰项。`);
        return null;
    }


    /**
     * @description 为当前问题生成选项列表 (1个正确答案 + 3个干扰项)
     * @param {object} correctData - 正确答案的数据对象
     * @param {string} level - 当前游戏模式 ('beginner' or 'intermediate')
     * @returns {string[]} 包含 4 个选项 (平假名) 的数组
     */
    function generateOptions(correctData, level) {
        const correctHiragana = correctData.hiragana; // 正确答案的平假名
        const options = [correctHiragana]; // 初始化选项列表，包含正确答案
        const basePool = level === 'beginner' ? katakanaChars : katakanaWords; // 根据模式选择题库
        const maxOptions = 4; // 总共需要 4 个选项

        // 1. 尝试生成一个相似的干扰项
        const similarDistractor = generateSimilarHiragana(correctHiragana, options);
        if (similarDistractor) {
            options.push(similarDistractor); // 如果成功生成，添加到选项列表
        }

        // 2. 从题库中选择不相关的干扰项，直到选项达到 4 个
        const hiraganaPool = basePool.map(item => item.hiragana); // 获取题库中所有平假名
        let availableDistractors = shuffleArray([...hiraganaPool]); // 打乱题库

        let addedCount = 0;
        const maxAddAttempts = hiraganaPool.length * 2; // 防止无限循环

        while (options.length < maxOptions && addedCount < maxAddAttempts) {
            const potentialDistractor = availableDistractors.pop(); // 从打乱的题库中取出一个
            // 检查是否有效、不等于正确答案、且尚未在选项中
            if (potentialDistractor && potentialDistractor !== correctHiragana && !options.includes(potentialDistractor)) {
                options.push(potentialDistractor); // 添加到选项列表
            }
            // 如果题库抽完了，重置并继续尝试 (理论上题库足够大时不需要)
            if (availableDistractors.length === 0 && options.length < maxOptions) {
                 availableDistractors = shuffleArray([...hiraganaPool]);
                 console.warn("选项池耗尽，重新洗牌以获取干扰项。");
            }
            addedCount++;
        }

        // 3. 如果尝试多次后选项仍不足 4 个 (例如题库太小或生成干扰项失败)
        if (options.length < maxOptions) {
            console.warn(`未能生成足够的干扰项 (需要 ${maxOptions}，实际 ${options.length})，将尝试补充随机基础假名。`);
            const basicCharsPool = shuffleArray(Array.from(basicHiraganaChars));
            while (options.length < maxOptions) {
                const fallback = basicCharsPool.pop() || '？'; // 取随机基础假名，或用问号兜底
                 if (!options.includes(fallback)) {
                     options.push(fallback);
                 }
            }
        }

        // 确保最终返回 4 个选项，并再次打乱顺序
        return shuffleArray(options.slice(0, maxOptions));
    }


    /**
     * @description 显示当前词语的附加信息 (含义、来源等)，仅在中级模式下有效
     * @param {object} data - 词语的数据对象
     */
    function displayWordInfo(data) {
        wordInfoArea.innerHTML = ''; // 先清空
        wordInfoArea.classList.add('hidden'); // 默认隐藏

        // 仅在中级模式且数据有效时显示
        if (currentLevel === 'intermediate' && data && (data.meaning || data.english)) {
            let content = '';
            if (data.meaning) {
                content += `<span><strong>含义:</strong> ${data.meaning}</span>`;
            }
            if (data.english) { // 显示英文或其他来源信息
                content += `<span><strong>来源/英文:</strong> ${data.english}</span>`;
            }
            if (content) { // 如果有内容才显示
                wordInfoArea.innerHTML = content;
                wordInfoArea.classList.remove('hidden');
            }
        }
    }

    /**
     * @description 处理用户的答案选择或超时
     * @param {boolean} isCorrect - 答案是否正确
     * @param {HTMLElement | null} button - 用户点击的按钮元素 (超时则为 null)
     */
    function handleAnswer(isCorrect, button = null) {
        // 如果已经回答过，直接返回，防止重复处理
        if (isAnswered) return;
        isAnswered = true; // 标记为已回答

        const answerTime = Date.now(); // 获取回答时间点
        stopTimer(); // 停止计时器
        stopQuizButton.disabled = true; // 暂时禁用 "结束挑战" 按钮，防止在延迟期间误触
        // 禁用所有选项按钮
        optionButtons.forEach(btn => { btn.disabled = true; });

        // 处理正确答案
        if (isCorrect) {
            // 计算回答用时 (秒)
            const timeTaken = (answerTime - questionStartTime) / 1000;
            correctAnswerTimes.push(timeTaken); // 记录用时

            if (button) {
                button.classList.add('correct'); // 给正确按钮添加 'correct' 样式
            }
            feedbackArea.textContent = '正确!'; // 显示反馈信息
            feedbackArea.className = 'correct'; // 添加 'correct' 样式

            // 如果是中级模式，增加分数并更新显示
            if (currentLevel === 'intermediate') {
                score++;
                scoreDisplay.textContent = `分数: ${score}`;
            }
        }
        // 处理错误答案
        else {
            if (button) {
                button.classList.add('incorrect'); // 给选错的按钮添加 'incorrect' 样式
            }
            // 显示错误反馈，并告知正确答案
            feedbackArea.textContent = `错误。正确答案是: "${correctAnswerData.hiragana}"`;
            feedbackArea.className = 'incorrect'; // 添加 'incorrect' 样式

            // 高亮显示正确的选项按钮
            optionButtons.forEach(btn => {
                if (btn.querySelector('.hiragana-text').textContent === correctAnswerData.hiragana) {
                    btn.classList.add('show-correct'); // 添加 'show-correct' 样式
                }
            });
        }

        // 短暂延迟后，显示所有选项的罗马音和词语信息
        setTimeout(() => {
            optionButtons.forEach(btn => btn.classList.add('show-romaji')); // 添加 'show-romaji' 类
            displayWordInfo(correctAnswerData); // 显示词语信息 (中级模式)
        }, 150); // 150毫秒延迟

        // 根据设置决定如何进入下一题
        if (autoNextMode) {
            // 自动模式：根据对错设置不同的延迟后加载下一题
            let delay = isCorrect ? autoDelayCorrect : autoDelayIncorrect;
            setTimeout(loadQuestion, delay);
        } else {
            // 手动模式：延迟一段时间后显示 "下一题" 按钮，并重新启用 "结束挑战" 按钮
            setTimeout(() => {
                nextQuestionButton.classList.remove('hidden'); // 显示 "下一题" 按钮
                stopQuizButton.disabled = false; // 重新启用 "结束挑战" 按钮
            }, 500); // 500毫秒延迟
        }
    }

    /**
     * @description 用户点击选项按钮时的处理函数
     * @param {HTMLElement} button - 被点击的按钮元素
     */
    function selectAnswer(button) {
        // 如果问题已回答，则不处理
        if (isAnswered) return;
        // 获取按钮上显示的平假名
        const selectedHiragana = button.querySelector('.hiragana-text').textContent;
        // 判断选择是否正确
        const isCorrect = selectedHiragana === correctAnswerData.hiragana;
        // 调用核心处理函数
        handleAnswer(isCorrect, button);
    }

    /**
     * @description 处理答题超时的情况
     */
    function handleTimeout() {
        // 如果问题已回答，则不处理 (理论上定时器已停止，但作为保险)
        if (isAnswered) return;
        // 调用核心处理函数，标记为错误，不传入按钮
        handleAnswer(false, null);
        // 更新反馈信息为超时
        feedbackArea.textContent = `时间到! 正确答案是: "${correctAnswerData.hiragana}"`;
        feedbackArea.className = 'incorrect'; // 使用错误样式
    }

    // --- 定时器控制 ---

    /**
     * @description 启动当前问题的计时器
     */
    function startTimer() {
        timeLeft = gameTimeLimit; // 重置剩余时间
        timerDisplay.textContent = `剩余 ${timeLeft} 秒`; // 初始化显示

        // 清除上一个计时器 (如果存在)
        if (timerId) clearInterval(timerId);

        // 创建新的计时器，每秒更新一次
        timerId = setInterval(() => {
            timeLeft--; // 时间减 1
            timerDisplay.textContent = `剩余 ${timeLeft} 秒`; // 更新显示
            // 如果时间耗尽
            if (timeLeft <= 0) {
                clearInterval(timerId); // 清除计时器
                timerId = null;
                handleTimeout(); // 处理超时
            }
        }, 1000); // 每 1000 毫秒 (1秒) 执行一次
    }

    /**
     * @description 停止当前计时器
     */
    function stopTimer() {
        if (timerId) {
            clearInterval(timerId); // 清除计时器
            timerId = null;
        }
    }

    // --- 重置与停止 ---

    /**
     * @description 重置所有选项按钮的样式和状态
     */
    function resetOptionButtons() {
        optionButtons.forEach(button => {
            button.className = 'option-button'; // 恢复默认 class
            button.disabled = false;          // 启用按钮
            button.style.opacity = '1';       // 恢复不透明度
            button.onclick = null;            // 清除旧的点击事件 (将在 loadQuestion 中重新绑定)
            // 清空按钮文本内容
            const hiraganaSpan = button.querySelector('.hiragana-text');
            const romajiSpan = button.querySelector('.romaji-text');
            if(hiraganaSpan) hiraganaSpan.textContent = '';
            if(romajiSpan) romajiSpan.textContent = '';
        });
        feedbackArea.textContent = '';          // 清空反馈信息
        feedbackArea.className = '';              // 移除反馈样式
        timerDisplay.textContent = '';          // 清空计时器显示
        wordInfoArea.classList.add('hidden');   // 隐藏词语信息区域
        wordInfoArea.innerHTML = '';            // 清空词语信息内容
    }

    /**
     * @description 用户点击 "结束挑战" 按钮的处理函数
     */
    function stopQuiz() {
        // 确认是否真的要结束
        if (!confirm('您确定要提前结束本次挑战吗？')) {
            return; // 用户取消则不执行任何操作
        }

        // 标记为手动停止
        quizStoppedManually = true;
        stopTimer(); // 停止计时器
        // 直接调用结束测验的函数
        endQuiz();
    }

    // --- 评级计算 ---

    /**
     * @description 根据平均答题时间和准确率计算评级 (仅中级模式)
     * @param {number} averageTime - 平均正确答题时间 (秒)
     * @param {number} accuracy - 准确率 (0 到 1 之间)
     * @returns {{text: string, class: string}} 包含评级文本和对应 CSS class 的对象
     */
    function getRating(averageTime, accuracy) {
        let rating = "日语新手"; // 默认评级
        let ratingClass = "rating-novice"; // 默认评级样式

        // 如果没有有效数据 (例如没有答对的题目)，则无法评级
        if (isNaN(averageTime) || averageTime <= 0 || isNaN(accuracy) || accuracy < 0) {
            return { text: "无法评级 (需要更多有效作答)", class: ratingClass };
        }

        // 根据时间和准确率设定评级阈值 (数值可调整)
        // 评级从高到低排列
        if (averageTime <= 2.8 && accuracy >= 0.95) { rating = "日语大王"; ratingClass = "rating-emperor"; }
        else if (averageTime <= 3.2 && accuracy >= 0.90) { rating = "日语小王"; ratingClass = "rating-shogun"; }
        else if (averageTime <= 3.8 && accuracy >= 0.85) { rating = "日语达人"; ratingClass = "rating-master"; }
        else if (averageTime <= 4.5 && accuracy >= 0.75) { rating = "日语学者"; ratingClass = "rating-intermediate"; }
        else if (averageTime <= 5.5 && accuracy >= 0.65) { rating = "日语学徒"; ratingClass = "rating-beginner"; }
        // 其他情况保持默认 "日语新手"

        // 在评级文本后附加平均时间和准确率信息
        const accuracyPercent = (accuracy * 100).toFixed(1); // 准确率百分比，保留一位小数
        rating += ` (平均 ${averageTime.toFixed(2)} 秒, 准确率 ${accuracyPercent}%)`;

        return { text: rating, class: ratingClass };
    }

    // --- 结束测验与历史记录 ---

    /**
     * @description 结束当前测验，显示结果并保存历史记录
     */
    function endQuiz() {
        stopTimer(); // 确保计时器已停止

        // 切换界面显示：隐藏测验区域，显示结果和历史区域
        quizAreaDiv.classList.add('hidden');
        resultAreaDiv.classList.remove('hidden');
        historyAreaDiv.classList.remove('hidden'); // 显示历史区域
        // 移除容器上的模式特定类
        if (quizContainerDiv) {
            quizContainerDiv.classList.remove('level-beginner', 'level-intermediate');
        } else {
             console.error("结束测验时无法找到 .quiz-container");
        }


        let questionsAttempted;       // 尝试的问题总数
        let totalPossible;          // 该模式下的总问题数
        let resultTextForHistory;     // 用于保存到历史记录的文本
        const levelName = currentLevel === 'beginner' ? '初级' : '中级'; // 获取模式中文名

        // 根据模式计算并显示结果
        if (currentLevel === 'beginner') {
            questionsAttempted = questionsAnsweredInBeginner.size; // 已回答的不同问题数
            totalPossible = totalBeginnerQuestions; // 初级总假名数
            finalRatingP.classList.add('hidden'); // 初级模式不显示评级

            if (quizStoppedManually) { // 如果是手动停止
                finalScoreP.textContent = `初级模式已停止`;
                totalQuestionsP.textContent = `您学习了 ${questionsAttempted} / ${totalPossible} 个假名。`;
                resultTextForHistory = `停止 (完成 ${questionsAttempted}/${totalPossible})`;
            } else { // 如果是自然完成
                finalScoreP.textContent = `初级模式完成!`;
                totalQuestionsP.textContent = `恭喜您学习了全部 ${totalPossible} 个假名。`;
                resultTextForHistory = `完成 (${totalPossible} 假名)`;
            }
            // 保存历史记录 (模式, 完成数, 总数, 是否停止)
            saveHistory(levelName, questionsAttempted, totalPossible, quizStoppedManually);
        } else { // intermediate
            totalPossible = currentQuestions.length; // 中级总词汇数
             // 计算尝试的题数：如果是手动停止且当前题目未回答，则减1
             questionsAttempted = quizStoppedManually && !isAnswered ? Math.max(0, currentQuestionIndex - 1) : currentQuestionIndex;

            // 计算平均时间和准确率
            let averageTime = NaN;
            let accuracy = 0;
            if (correctAnswerTimes.length > 0) { // 只有答对过题目才能计算平均时间
                averageTime = correctAnswerTimes.reduce((sum, time) => sum + time, 0) / correctAnswerTimes.length;
            }
            if (questionsAttempted > 0) { // 只有尝试过题目才能计算准确率
                accuracy = score / questionsAttempted;
            }

            // 获取评级
            const ratingResult = getRating(averageTime, accuracy);
            finalRatingP.textContent = ratingResult.text; // 显示评级文本
            finalRatingP.className = ''; // 清除旧 class
            finalRatingP.classList.add(ratingResult.class); // 添加新评级 class

            // 只有在有有效作答时才显示评级
             if (questionsAttempted > 0 && !isNaN(averageTime)) {
                  finalRatingP.classList.remove('hidden');
             } else {
                 finalRatingP.classList.add('hidden');
             }

            // 显示最终分数和完成情况
            if (quizStoppedManually) { // 如果是手动停止
                finalScoreP.textContent = `中级模式已停止 - 得分: ${score}`;
                totalQuestionsP.textContent = `您在 ${questionsAttempted} 题中答对 ${score} 题 (共 ${totalPossible} 词)。`;
                resultTextForHistory = `停止 (得分 ${score}/${questionsAttempted}, 共${totalPossible})`;
            } else { // 如果是自然完成
                finalScoreP.textContent = `最终得分: ${score}`;
                totalQuestionsP.textContent = `共 ${totalPossible} 题，您答对了 ${score} 题。`;
                resultTextForHistory = `得分 ${score}/${totalPossible}`;
            }
            // 保存历史记录 (模式, 分数, 尝试数, 是否停止, 总数)
            saveHistory(levelName, score, questionsAttempted, quizStoppedManually, totalPossible);
        }

        // 刷新历史记录显示
        loadHistory();
    }

    /**
     * @description 显示模式选择界面，重置到初始状态
     */
    function showLevelSelection() {
        settingsArea.classList.remove('hidden');      // 显示设置区域
        levelSelectionDiv.classList.remove('hidden'); // 显示模式选择区域
        quizAreaDiv.classList.add('hidden');        // 隐藏测验区域
        resultAreaDiv.classList.add('hidden');        // 隐藏结果区域
        historyAreaDiv.classList.remove('hidden');    // 显示历史区域 (初始状态也显示)
        // 移除容器上的模式特定类
         if (quizContainerDiv) {
             quizContainerDiv.classList.remove('level-beginner', 'level-intermediate');
         }
        // 如果有正在运行的计时器，停止它
        if (timerId) {
            stopTimer();
        }
        // 确保加载最新的历史记录
        loadHistory();
    }

    // --- 本地存储与历史记录管理 ---


    /**
     * @description 保存本次测验结果到本地存储
     * @param {string} levelName - 模式名称 ('初级' 或 '中级')
     * @param {number} scoreOrCompleted - 得分 (中级) 或 完成数 (初级)
     * @param {number} attempted - 尝试/总题目数 (初级是总数，中级是尝试数或总数)
     * @param {boolean} stopped - 是否手动停止
     * @param {number | null} totalPossible - 中级模式下的总题数 (可选)
     */
    function saveHistory(levelName, scoreOrCompleted, attempted, stopped, totalPossible = null) {
        // 从 localStorage 读取现有历史记录，如果不存在则初始化为空数组
        const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');

        // 获取当前时间并格式化
        const now = new Date();
        const dateString = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        // 根据参数构建结果描述文本 (已在 endQuiz 中生成，这里直接使用)
        let resultString = '';
        if (levelName === '初级') {
            resultString = stopped ? `停止 (完成 ${scoreOrCompleted}/${attempted})` : `完成 (${attempted} 假名)`;
        } else { // 中级
            const totalStr = totalPossible ? ` (共${totalPossible})` : '';
            resultString = stopped ? `停止 (得分 ${scoreOrCompleted}/${attempted}${totalStr})` : `得分 ${scoreOrCompleted}/${attempted}`;
        }

        // 创建新的历史记录条目
        const entry = {
            date: dateString,
            level: levelName,
            result: resultString
        };

        // 将新条目添加到历史记录数组的开头
        history.unshift(entry);

        // 如果历史记录超过最大条数，移除最旧的条目
        if (history.length > MAX_HISTORY_ITEMS) {
            history.pop();
        }

        // 将更新后的历史记录数组存回 localStorage
        try {
            localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
        } catch (e) {
            console.error("保存历史记录到 localStorage 时出错:", e);
            // 可以在这里给用户一个提示，例如 "无法保存历史记录，可能是存储空间已满。"
        }
    }

    /**
     * @description 从本地存储加载历史记录并显示在页面上
     */
    function loadHistory() {
        // 读取历史记录
        const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
        // 清空当前的列表显示
        historyListUl.innerHTML = '';

        // 获取清空按钮元素
        const clearBtn = historyAreaDiv.querySelector('.clear-btn');

        if (history.length === 0) {
            // 如果没有历史记录，显示提示信息
            historyListUl.innerHTML = '<li>暂无挑战记录。</li>';
            // 隐藏清空按钮
            if(clearBtn) clearBtn.style.display = 'none';
        } else {
            // 如果有历史记录，显示清空按钮
             if(clearBtn) clearBtn.style.display = 'inline-block';
            // 遍历历史记录数组，为每个条目创建列表项并添加到 Ul 元素中
            history.forEach(entry => {
                const li = document.createElement('li');
                // 设置列表项内容，包含日期、模式和结果
                li.innerHTML = `<span>${entry.date} (${entry.level})</span> <span>${entry.result}</span>`;
                historyListUl.appendChild(li);
            });
        }
    }

    /**
     * @description 清空本地存储中的所有历史记录
     */
    function clearHistory() {
        // 弹出确认对话框，防止用户误操作
        if (confirm('确定要清空所有挑战历史记录吗？此操作无法撤销。')) {
            // 用户确认后，移除对应的 localStorage 条目
            localStorage.removeItem(HISTORY_STORAGE_KEY);
            // 重新加载历史记录列表 (此时会显示 "暂无记录")
            loadHistory();
        }
    }

});
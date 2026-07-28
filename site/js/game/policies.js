import {postLedgerEntry} from './finance.js';

const choice=(id,label,initialCost,weeklyCost,knownEffect,uncertainty,effects,flags=[])=>({id,label,initialCost,weeklyCost,knownEffect,uncertainty,effects,flags});

export const POLICY_CASES=[
  {id:'school-lunch',icon:'🍱',category:'子育て',district:'school',title:'学校給食の負担をどうする？',requester:'保護者代表',body:'物価高で給食費の負担が増えています。来年度からの支援方式を決めます。',choices:[
    choice('universal','全員を無償化',40,8,'子育て世帯の負担を大きく軽減','継続費が財政を圧迫する可能性',{life:8,support:5},['policy-lunch-universal']),
    choice('targeted','所得制限付きで支援',18,4,'必要な家庭へ重点的に支援','線引きへの不満が出る可能性',{life:5,support:2},['policy-lunch-targeted']),
    choice('keep','現状維持',0,0,'市予算を温存','子育て世帯の不満が強まる可能性',{life:-3,support:-4},['policy-lunch-keep'])]},
  {id:'night-bus',icon:'🚌',category:'交通',district:'residential',title:'深夜交通を確保する？',requester:'夜勤労働者',body:'病院や工場で働く市民から終電後の交通手段を求める声が届いています。',choices:[
    choice('daily','毎日深夜バスを運行',22,6,'夜勤者の移動を安定化','利用率が低い場合は赤字が続く',{life:6,economy:3,support:3},['policy-night-daily']),
    choice('trial','週末に試験運行',8,2,'需要を測りながら開始','平日利用者の不満は残る',{life:3,support:1},['policy-night-trial']),
    choice('taxi','対象者へタクシー補助',6,3,'必要な人へ絞って支援','申請手続きが複雑になる可能性',{life:3},['policy-night-taxi'])]},
  {id:'solar-public',icon:'☀️',category:'環境',district:'central',title:'公共施設へ太陽光発電を導入',requester:'環境政策室',body:'電気代と排出量を抑えるため、公共施設へ設備投資する提案です。',choices:[
    choice('all','全施設へ一括導入',55,1,'環境指標と将来収支を改善','設備故障や更新費が発生する可能性',{environment:9,economy:2},['policy-solar-all']),
    choice('schools','学校から段階導入',24,1,'教育施設から環境改善','全体効果が出るまで時間がかかる',{environment:5,life:1},['policy-solar-school']),
    choice('wait','価格低下を待つ',0,0,'予算を温存','環境政策の遅れを批判される可能性',{environment:-2,support:-1},['policy-solar-wait'])]},
  {id:'childcare-staff',icon:'🧸',category:'福祉',district:'residential',title:'保育士不足へ市独自手当',requester:'保育士代表',body:'人手不足で受け入れ枠が減っています。待遇改善への市独自支援を検討します。',choices:[
    choice('large','大幅な手当を支給',32,7,'人材確保と待機児童対策','周辺自治体との人材競争が起きる可能性',{life:8,support:5,economy:2},['policy-childcare-large']),
    choice('small','小額手当で段階対応',14,3,'財政と待遇改善を両立','改善速度が足りない可能性',{life:5,support:2},['policy-childcare-small']),
    choice('training','研修支援に限定',7,1,'専門性を高める','待遇への直接的効果は小さい',{life:2},['policy-childcare-training'])]},
  {id:'factory-invite',icon:'🏭',category:'産業',district:'industry',title:'大型工場を誘致する？',requester:'企業誘致担当',body:'雇用と税収が期待される一方、交通量と環境負荷の増加が見込まれます。',choices:[
    choice('priority','税制優遇して誘致',30,2,'雇用と経済を大きく改善','環境問題や住民反対が起きる可能性',{economy:10,environment:-5,life:-1},['policy-factory-priority']),
    choice('conditions','環境条件付きで誘致',20,2,'経済と環境の均衡を取る','企業が条件を嫌い撤退する可能性',{economy:6,environment:-1},['policy-factory-conditions']),
    choice('decline','誘致を断る',0,0,'環境負荷を避ける','雇用機会を逃す可能性',{economy:-3,environment:4,support:1},['policy-factory-decline'])]},
  {id:'online-office',icon:'💻',category:'デジタル',district:'central',title:'市役所手続きをオンライン化',requester:'DX推進室',body:'住民票や各種申請をスマートフォンで完結させる計画です。',choices:[
    choice('full','一括オンライン化',42,3,'利便性と行政効率を大幅改善','高齢者や不慣れな住民が取り残される可能性',{life:7,economy:3,support:2},['policy-dx-full']),
    choice('phase','主要手続きから導入',20,2,'段階的に利便性を改善','移行期間が長くなる',{life:4,economy:1},['policy-dx-phase']),
    choice('counter','窓口中心を維持',4,1,'対面支援を維持','行政効率が改善しない',{life:1,economy:-2},['policy-dx-counter'])]},
  {id:'bike-lane',icon:'🚲',category:'交通',district:'central',title:'自転車レーンを整備する？',requester:'交通安全協議会',body:'事故防止と渋滞緩和のため、主要道路に専用レーンを設ける案です。',choices:[
    choice('network','市内一帯に整備',38,2,'安全と環境を大きく改善','車線減少への反発が起きる可能性',{safety:7,environment:6,life:2},['policy-bike-network']),
    choice('core','中心部だけ整備',18,1,'効果の高い場所へ集中','地区間格差が出る可能性',{safety:4,environment:3},['policy-bike-core']),
    choice('paint','路面表示だけ追加',6,1,'低予算で注意喚起','物理的な安全効果は限定的',{safety:2},['policy-bike-paint'])]},
  {id:'holiday-clinic',icon:'🏥',category:'医療',district:'residential',title:'休日診療所を新設する？',requester:'医師会',body:'休日の救急外来が混雑しています。市営診療所の運営方法を決めます。',choices:[
    choice('permanent','常設診療所を開設',48,9,'安心と医療アクセスを改善','医療人材の確保が難航する可能性',{life:7,safety:7,support:4},['policy-clinic-permanent']),
    choice('rotation','既存病院の輪番制を支援',20,4,'既存資源を活用して改善','病院間の負担差が出る可能性',{life:5,safety:4},['policy-clinic-rotation']),
    choice('phone','相談窓口のみ設置',5,1,'低予算で案内を改善','混雑そのものは解消しない',{life:2,safety:1},['policy-clinic-phone'])]}
];

const clamp=value=>Math.max(0,Math.min(100,Math.round(value)));
export const getPolicyCase=id=>POLICY_CASES.find(policy=>policy.id===id)||null;

export function choosePolicyCase(state,rng=Math.random){
  const recent=new Set((state.history||[]).filter(item=>item.type==='policy').slice(0,4).map(item=>item.sourceId));
  const pool=POLICY_CASES.filter(policy=>!recent.has(policy.id));
  const source=pool.length?pool:POLICY_CASES;
  return source[Math.min(source.length-1,Math.floor(rng()*source.length))];
}

export function applyPolicyChoice(state,policyId,choiceId){
  const policy=getPolicyCase(policyId);
  const option=policy?.choices.find(choice=>choice.id===choiceId);
  if(!policy||!option)return {state,error:'政策または選択肢が見つかりません'};
  if(state.treasury<option.initialCost)return {state,error:'市予算が不足しています'};
  let next=postLedgerEntry(state,{week:state.week,phase:'policy',category:'policy',label:`${policy.title}：${option.label}`,amount:-option.initialCost,sourceId:`policy:${policy.id}:${option.id}`,settlementKey:'initial'});
  for(const [key,value] of Object.entries(option.effects))if(['support','economy','life','environment','safety','councilApproval'].includes(key))next={...next,[key]:clamp((next[key]??50)+value)};
  if(option.weeklyCost>0){
    const recurring={id:`${policy.id}:${option.id}`,policyId:policy.id,choiceId:option.id,label:option.label,weeklyCost:option.weeklyCost,status:'active',startedWeek:state.week};
    next={...next,recurringPolicies:[...next.recurringPolicies.filter(item=>item.policyId!==policy.id),recurring]};
  }
  next={...next,flags:[...new Set([...(next.flags||[]),...(option.flags||[])])],history:[{id:`policy:${policy.id}:${state.week}`,week:state.week,type:'policy',sourceId:policy.id,title:policy.title,choice:option.label,knownEffect:option.knownEffect,uncertainty:option.uncertainty},...next.history],newsQueue:[{id:`policy-news:${policy.id}:${state.week}`,week:state.week,type:'policy',title:policy.title,body:`${option.label}を実施しました。`,createdAt:new Date().toISOString()},...next.newsQueue]};
  return {state:next,policy,choice:option};
}

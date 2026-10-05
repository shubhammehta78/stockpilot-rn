import {useEffect,useRef,useState} from "react";
import {Animated,Pressable,ScrollView,Text,View,StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Card from "../../src/components/Card";
import HoldingRow from "../../src/components/HoldingRow";
import {Holding} from "../../src/data/mock";
import {portfolioRepository} from "../../src/data/repository";
import {portfolioValue,investedValue,portfolioPnl,portfolioReturn} from "../../src/domain/portfolio";
import {colors,spacing} from "../../src/theme";

const chartSets={ "1M":[35,39,37,48,44,53,49,61,57,72,68,78], "3M":[30,38,34,46,42,55,51,63,59,70,67,82], "1Y":[22,31,28,39,35,48,43,58,54,65,61,76], "ALL":[18,25,22,35,31,43,40,51,47,62,58,80] };
type Range=keyof typeof chartSets;

function AnimatedNumber({value,prefix="",suffix=""}:{value:number;prefix?:string;suffix?:string}){
 const progress=useRef(new Animated.Value(0)).current; const[shown,setShown]=useState(0);
 useEffect(()=>{progress.setValue(0);Animated.timing(progress,{toValue:1,duration:900,useNativeDriver:false}).start();const id=progress.addListener(({value:v})=>setShown(value*v));return()=>progress.removeListener(id)},[value]);
 return <Text>{prefix}{shown.toLocaleString(undefined,{maximumFractionDigits:suffix?1:0})}{suffix}</Text>;
}

export default function Portfolio(){
 const[items,setItems]=useState<Holding[]|null>(null);const[range,setRange]=useState<Range>("3M");const entrance=useRef(new Animated.Value(0)).current;const pulse=useRef(new Animated.Value(1)).current;
 useEffect(()=>{portfolioRepository.getHoldings().then(setItems);Animated.stagger(90,[Animated.spring(entrance,{toValue:1,useNativeDriver:true,damping:14,stiffness:110}),Animated.spring(pulse,{toValue:1.04,useNativeDriver:true,damping:8,stiffness:140})]).start()},[]);
 if(!items)return <SafeAreaView style={s.safe}><View style={s.loader}><Animated.View style={s.loaderDot}/><Text style={s.muted}>Loading portfolio</Text></View></SafeAreaView>;
 const value=portfolioValue(items),invested=investedValue(items),pnl=portfolioPnl(items),ret=portfolioReturn(items),positive=pnl>=0;
 const animatedStyle={opacity:entrance,transform:[{translateY:entrance.interpolate({inputRange:[0,1],outputRange:[28,0]})},{scale:entrance.interpolate({inputRange:[0,1],outputRange:[.96,1]})}]};
 return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
  <Animated.View style={animatedStyle}>
   <Text style={s.eyebrow}>STOCKPILOT</Text><Text style={s.title}>Portfolio</Text><Text style={s.sub}>A live view of your money, organized.</Text>
   <Animated.View style={{transform:[{scale:pulse}]}}>
    <Card><Text style={s.label}>TOTAL VALUE</Text><Text style={s.big}><AnimatedNumber value={value} prefix="$"/></Text>
     <View style={s.liveRow}><View style={s.liveDot}/><Text style={s.live}>MARKET SNAPSHOT</Text></View>
     <Text style={[s.pnl,{color:positive?colors.accent:colors.danger}]}>{positive?"+":"-"}$<AnimatedNumber value={Math.abs(pnl)}/><Text> unrealized P&L</Text></Text>
     <View style={s.metrics}><View><Text style={s.label}>Invested</Text><Text style={s.metric}>$<AnimatedNumber value={invested}/></Text></View><View><Text style={s.label}>Return</Text><Text style={[s.metric,{color:positive?colors.accent:colors.danger}]}><AnimatedNumber value={ret} suffix="%"/></Text></View></View>
    </Card>
   </Animated.View>
  </Animated.View>

  <AnimatedChart bars={chartSets[range]} range={range} setRange={setRange} ret={ret} positive={positive}/>
  <Animated.View style={{opacity:entrance,transform:[{translateY:entrance.interpolate({inputRange:[0,1],outputRange:[24,0]})}]}}>
   <View style={s.holdingsHeader}><View><Text style={s.section}>Holdings</Text><Text style={s.chartSub}>Your current positions</Text></View><AnimatedBadge count={items.length}/></View>
   <Card>{items.map((h,i)=><AnimatedHolding key={h.id} item={h} index={i}/>)}</Card>
  </Animated.View>
 </ScrollView></SafeAreaView>;
}

function AnimatedChart({bars,range,setRange,ret,positive}:{bars:number[];range:Range;setRange:(r:Range)=>void;ret:number;positive:boolean}){\n const draw=useRef(new Animated.Value(0)).current;const scan=useRef(new Animated.Value(0)).current;\n useEffect(()=>{draw.setValue(0);scan.setValue(0);Animated.parallel([Animated.timing(draw,{toValue:1,duration:1200,useNativeDriver:true}),Animated.loop(Animated.sequence([Animated.timing(scan,{toValue:1,duration:1400,useNativeDriver:true}),Animated.timing(scan,{toValue:0,duration:1400,useNativeDriver:true})]))]).start();return()=>{draw.stopAnimation();scan.stopAnimation()}},[range]);\n const width=300,max=90;const pts=bars.map((v,i)=>({x:i*(width/(bars.length-1)),y:112-(v/max)*100}));\n return <Animated.View style={[s.chart,{transform:[{scale:draw.interpolate({inputRange:[0,1],outputRange:[.96,1]})}],opacity:draw}]}>\n  <View style={s.chartHeader}><View><Text style={s.section}>Performance</Text><Text style={s.chartSub}>Portfolio trend</Text></View><Text style={s.trend}>↗ {positive?"+":"-"}{Math.abs(ret).toFixed(1)}%</Text></View>\n  <View style={s.rangeRow}>{(["1M","3M","1Y","ALL"] as Range[]).map(item=><RangeButton key={item} active={range===item} label={item} onPress={()=>setRange(item)}/>)}</View>\n  <View style={s.graph}><View style={[s.graphLine,{top:"25%"}]}/><View style={[s.graphLine,{top:"50%"}]}/><View style={[s.graphLine,{top:"75%"}]}/><View style={s.plot}>\n   {pts.slice(1).map((p,i)=>{const a=pts[i],dx=p.x-a.x,dy=p.y-a.y;return <Animated.View key={i} style={[s.segment,{left:a.x,top:a.y,width:Math.hypot(dx,dy),transformOrigin:"left center",transform:[{rotate:Math.atan2(dy,dx)+"rad"},{scaleX:draw}]}]}/>})}\n   {pts.map((p,i)=><Animated.View key={"p"+i} style={[s.point,{left:p.x-4,top:p.y-4,opacity:draw}]}/>)}\n   <Animated.View style={[s.scanner,{transform:[{translateX:scan.interpolate({inputRange:[0,1],outputRange:[0,width-16]})}],opacity:scan}]}/>\n  </View></View><View style={s.axis}><Text style={s.muted}>{range==="1M"?"Sep 4":range==="3M"?"Jul":"Oct 2025"}</Text><Text style={s.muted}>Today</Text></View>\n </Animated.View>\n}\nfunction RangeButton({active,label,onPress}:{active:boolean;label:string;onPress:()=>void}){const scale=useRef(new Animated.Value(1)).current;return <Pressable onPress={()=>{Animated.sequence([Animated.spring(scale,{toValue:.9,useNativeDriver:true}),Animated.spring(scale,{toValue:1,useNativeDriver:true})]).start();onPress()}}><Animated.View style={[s.rangeButton,active&&s.rangeActive,{transform:[{scale}]}]}><Text style={[s.rangeText,active&&s.rangeTextActive]}>{label}</Text></Animated.View></Pressable>}

function AnimatedBar({height,index}:{height:number;index:number}){const v=useRef(new Animated.Value(0)).current;useEffect(()=>{Animated.spring(v,{toValue:1,useNativeDriver:true,delay:index*42,damping:10,stiffness:150}).start()},[]);return <Animated.View style={[s.bar,{height,transform:[{scaleY:v}],opacity:v}]}/>}

function AnimatedHolding({item,index}:{item:Holding;index:number}){const v=useRef(new Animated.Value(0)).current;const press=useRef(new Animated.Value(1)).current;return <Animated.View style={{opacity:v,transform:[{translateX:v.interpolate({inputRange:[0,1],outputRange:[22,0]})},{scale:press}]}}><Pressable onPress={()=>Animated.sequence([Animated.spring(press,{toValue:.97,useNativeDriver:true}),Animated.spring(press,{toValue:1,useNativeDriver:true})]).start()}><HoldingRow item={item}/></Pressable></Animated.View>}

function AnimatedBadge({count}:{count:number}){const v=useRef(new Animated.Value(0)).current;useEffect(()=>{Animated.spring(v,{toValue:1,useNativeDriver:true,delay:500}).start()},[]);return <Animated.View style={[s.badge,{opacity:v,transform:[{scale:v}]}]}><Text style={s.badgeText}>{count} assets</Text></Animated.View>}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:colors.bg},container:{padding:spacing.lg,paddingBottom:44},eyebrow:{color:colors.accent,fontSize:11,fontWeight:"800",letterSpacing:2},title:{color:colors.text,fontSize:34,fontWeight:"800",marginTop:5},sub:{color:colors.muted,marginBottom:22},label:{color:colors.muted,fontSize:11,fontWeight:"700",letterSpacing:1.1},big:{color:colors.text,fontSize:40,fontWeight:"800",marginVertical:5},pnl:{fontSize:13,fontWeight:"700"},metrics:{flexDirection:"row",justifyContent:"space-between",marginTop:22},metric:{color:colors.text,fontSize:20,fontWeight:"700"},liveRow:{flexDirection:"row",alignItems:"center",gap:6,marginVertical:8},liveDot:{width:6,height:6,borderRadius:3,backgroundColor:colors.accent},live:{color:colors.accent,fontSize:9,fontWeight:"800",letterSpacing:1},
 chart:{backgroundColor:colors.surface,borderRadius:20,padding:16,marginTop:4,marginBottom:24,borderWidth:1,borderColor:colors.border},chartHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},section:{color:colors.text,fontSize:18,fontWeight:"700"},chartSub:{color:colors.muted,fontSize:11,marginTop:3},trend:{color:colors.accent,fontSize:12,fontWeight:"800"},
 rangeRow:{flexDirection:"row",marginTop:16,marginBottom:14,backgroundColor:colors.bg,borderRadius:10,padding:3},rangeButton:{paddingVertical:7,paddingHorizontal:13,alignItems:"center",borderRadius:8},rangeActive:{backgroundColor:colors.border},rangeText:{color:colors.muted,fontSize:11,fontWeight:"700"},rangeTextActive:{color:colors.text},
 chartArea:{height:130,position:"relative",overflow:"hidden"},gridLine:{position:"absolute",left:0,right:0,height:1,backgroundColor:colors.border,opacity:.55},bars:{height:120,flexDirection:"row",alignItems:"flex-end",paddingTop:8},bar:{flex:1,backgroundColor:colors.accent,borderRadius:5,marginHorizontal:3,minHeight:8,transformOrigin:"bottom"},axis:{flexDirection:"row",justifyContent:"space-between",marginTop:5},holdingsHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},muted:{color:colors.muted,fontSize:12},badge:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.border,borderRadius:20,paddingHorizontal:10,paddingVertical:6},badgeText:{color:colors.muted,fontSize:11,fontWeight:"700"},loader:{flex:1,alignItems:"center",justifyContent:"center",gap:10},loaderDot:{width:10,height:10,borderRadius:5,backgroundColor:colors.accent}
});
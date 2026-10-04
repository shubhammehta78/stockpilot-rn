import {useEffect,useRef,useState} from "react";
import {Animated,Pressable,ScrollView,Text,View,StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Card from "../../src/components/Card";
import HoldingRow from "../../src/components/HoldingRow";
import {Holding} from "../../src/data/mock";
import {portfolioRepository} from "../../src/data/repository";
import {portfolioValue,investedValue,portfolioPnl,portfolioReturn} from "../../src/domain/portfolio";
import {colors,spacing} from "../../src/theme";

const chartSets={
  "1M":[35,39,37,48,44,53,49,61,57,72,68,78],
  "3M":[30,38,34,46,42,55,51,63,59,70,67,82],
  "1Y":[22,31,28,39,35,48,43,58,54,65,61,76],
  "ALL":[18,25,22,35,31,43,40,51,47,62,58,80]
};

function AnimatedNumber({value,prefix="",suffix=""}:{value:number;prefix?:string;suffix?:string}){
  const progress=useRef(new Animated.Value(0)).current;
  const [shown,setShown]=useState(0);
  useEffect(()=>{Animated.timing(progress,{toValue:1,duration:850,useNativeDriver:false}).start();const id=progress.addListener(({value:v})=>setShown(value*v));return()=>progress.removeListener(id)},[value]);
  return <Text>{prefix}{shown.toLocaleString(undefined,{maximumFractionDigits:suffix?"1":0})}{suffix}</Text>;
}

export default function Portfolio(){
  const[items,setItems]=useState<Holding[]|null>(null);
  const[range,setRange]=useState<keyof typeof chartSets>("3M");
  const entrance=useRef(new Animated.Value(0)).current;
  useEffect(()=>{portfolioRepository.getHoldings().then(setItems);Animated.spring(entrance,{toValue:1,useNativeDriver:true,damping:16,mass:1,stiffness:120}).start()},[]);
  if(!items)return <SafeAreaView style={s.safe}><View style={s.loader}><View style={s.loaderDot}/><Text style={s.muted}>Loading portfolio</Text></View></SafeAreaView>;
  const value=portfolioValue(items),invested=investedValue(items),pnl=portfolioPnl(items),ret=portfolioReturn(items);
  const bars=chartSets[range],positive=pnl>=0;
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{opacity:entrance,transform:[{translateY:entrance.interpolate({inputRange:[0,1],outputRange:[18,0]})}]}}>
        <Text style={s.eyebrow}>STOCKPILOT</Text><Text style={s.title}>Portfolio</Text><Text style={s.sub}>A live view of your money, organized.</Text>
        <Card>
          <Text style={s.label}>Total value</Text>
          <Text style={s.big}><AnimatedNumber value={value} prefix="$"/></Text>
          <Text style={[s.pnl,{color:positive?colors.accent:colors.danger}]}>{positive?"+":"-"}$<AnimatedNumber value={Math.abs(pnl)}/><Text> unrealized P&L</Text></Text>
          <View style={s.metrics}>
            <View><Text style={s.label}>Invested</Text><Text style={s.metric}>$<AnimatedNumber value={invested}/></Text></View>
            <View><Text style={s.label}>Return</Text><Text style={[s.metric,{color:positive?colors.accent:colors.danger}]}><AnimatedNumber value={ret} suffix="%"/></Text></View>
          </View>
        </Card>
      </Animated.View>

      <View style={s.chart}>
        <View style={s.chartHeader}><View><Text style={s.section}>Performance</Text><Text style={s.chartSub}>Portfolio trend</Text></View><Text style={s.trend}>↗ {positive?"+":"-"}{Math.abs(ret).toFixed(1)}%</Text></View>
        <View style={s.rangeRow}>{(Object.keys(chartSets) as Array<keyof typeof chartSets>).map(item=><Pressable key={item} onPress={()=>setRange(item)} style={[s.rangeButton,range===item&&s.rangeActive]}><Text style={[s.rangeText,range===item&&s.rangeTextActive]}>{item}</Text></Pressable>)}</View>
        <View style={s.chartArea}>
          <View style={s.gridLine}/><View style={[s.gridLine,{top:"50%"}]}/><View style={[s.gridLine,{top:"100%"}]}/>
          <View style={s.bars}>{bars.map((h,i)=><AnimatedBar key={i} height={h} index={i}/>)}</View>
        </View>
        <View style={s.axis}><Text style={s.muted}>{range==="1M"?"Sep 4":range==="3M"?"Jul":"Oct 2025"}</Text><Text style={s.muted}>Today</Text></View>
      </View>

      <View style={s.holdingsHeader}><Text style={s.section}>Holdings</Text><Text style={s.muted}>{items.length} assets</Text></View>
      <Card>{items.map((h,i)=><AnimatedHolding key={h.id} item={h} index={i}/>)}</Card>
    </ScrollView>
  </SafeAreaView>;
}

function AnimatedBar({height,index}:{height:number;index:number}){
  const v=useRef(new Animated.Value(0)).current;
  useEffect(()=>{Animated.spring(v,{toValue:1,useNativeDriver:true,delay:index*45,damping:12,stiffness:130}).start()},[]);
  return <Animated.View style={[s.bar,{height,transform:[{scaleY:v}],opacity:v}]}/>;
}

function AnimatedHolding({item,index}:{item:Holding;index:number}){
  const v=useRef(new Animated.Value(0)).current;
  useEffect(()=>{Animated.timing(v,{toValue:1,duration:380,delay:index*70,useNativeDriver:true}).start()},[]);
  return <Animated.View style={{opacity:v,transform:[{translateX:v.interpolate({inputRange:[0,1],outputRange:[14,0]})}]}}><HoldingRow item={item}/></Animated.View>;
}

const s=StyleSheet.create({
  safe:{flex:1,backgroundColor:colors.bg},container:{padding:spacing.lg,paddingBottom:44},
  eyebrow:{color:colors.accent,fontSize:11,fontWeight:"800",letterSpacing:2},title:{color:colors.text,fontSize:34,fontWeight:"800",marginTop:5},sub:{color:colors.muted,marginBottom:22},
  label:{color:colors.muted,fontSize:12},big:{color:colors.text,fontSize:40,fontWeight:"800",marginVertical:5},pnl:{fontSize:13,fontWeight:"700"},metrics:{flexDirection:"row",justifyContent:"space-between",marginTop:22},metric:{color:colors.text,fontSize:20,fontWeight:"700"},
  chart:{backgroundColor:colors.surface,borderRadius:20,padding:16,marginTop:2,marginBottom:24,borderWidth:1,borderColor:colors.border},chartHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},section:{color:colors.text,fontSize:18,fontWeight:"700"},chartSub:{color:colors.muted,fontSize:11,marginTop:3},trend:{color:colors.accent,fontSize:12,fontWeight:"800"},
  rangeRow:{flexDirection:"row",marginTop:16,marginBottom:14,backgroundColor:colors.bg,borderRadius:10,padding:3},rangeButton:{flex:1,paddingVertical:7,alignItems:"center",borderRadius:8},rangeActive:{backgroundColor:colors.border},rangeText:{color:colors.muted,fontSize:11,fontWeight:"700"},rangeTextActive:{color:colors.text},
  chartArea:{height:130,position:"relative",overflow:"hidden"},gridLine:{position:"absolute",left:0,right:0,top:"25%",height:1,backgroundColor:colors.border,opacity:.55},bars:{height:120,flexDirection:"row",alignItems:"flex-end",paddingTop:8},bar:{flex:1,backgroundColor:colors.accent,borderRadius:5,marginHorizontal:3,minHeight:8,transformOrigin:"bottom"},axis:{flexDirection:"row",justifyContent:"space-between",marginTop:5},
  holdingsHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:12},muted:{color:colors.muted,fontSize:12},
  loader:{flex:1,alignItems:"center",justifyContent:"center",gap:10},loaderDot:{width:10,height:10,borderRadius:5,backgroundColor:colors.accent}
});
// Upgrade NOTE: replaced '_World2Object' with 'unity_WorldToObject'

Shader "game/treeLeaf"
{
    Properties
    {
        _MainTex ("Texture", 2D) = "white" {}
        _MainColor("MainColor", Color) = (1, 1, 1, 1)
        _Cutoff("Cutoff", Range(0,1)) = 0.5
        [Space(50)]
        [Header(Occlusion)]
        [Space(10)]
        _WorldYPosition("WorldYPosition", Range(0,2)) = 1
        _InnerAOAmount("InnerAOAmount", Range(0,10)) = 5
        _InnerAOLength("InnerAOLength", Range(0.5,10)) = 2
        _InnerAOPower("InnerAOPower", Range(0,10)) = 5
        _InnerAOColor("InnerAOColor", Color) = (1, 1, 1, 1)
        [Space(50)]
        [Header(Lightvector)]
        [Space(10)]
        _LightvectorX("LightVectorX", Range(-1,1)) = 0.5
        _LightvectorY("LightVectorY", Range(-1,1)) = 0.5
        _LightvectorZ("LightVectorZ", Range(-1,1)) = 0.5
        [Space(50)]
        [Header(SSS)]
        [Space(10)]
        _SSSColor("SSSColor", Color) = (1, 1, 1, 1)
        _BrightAmount("BrightAmount", Range(1, 3)) = 1
        _BrightPower("BrightPower", Range(0, 10)) = 1
        [Space(50)]
        [Header(Wind)]
        [Space(10)]
        _WindFoliageAmplitude("Wind Foliage Amplitude", Range( 0 , 1)) = 0
		_WindFoliageSpeed("Wind Foliage Speed", Range( 0 , 1)) = 0
    }
    SubShader
    {
        Tags { "Queue"="AlphaTest" "RenderType"="TransparentCutout"}
        LOD 100
        Cull Off

        Pass
        {
            CGPROGRAM
            // Upgrade NOTE: excluded shader from DX11; has structs without semantics (struct v2f members innerAo)
            //#pragma exclude_renderers d3d11
            #pragma vertex vert
            #pragma fragment frag
            // make fog work
            //#pragma multi_compile_fog

            #include "UnityCG.cginc"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                float3 normal : NORMAL;
                float4 color : COLOR;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                float3 innerAo : COLOR;
                float3 unmapedNormal : NORMAL;
                float3 normalDir: TEXCOORD1;
            };

            uniform float _WindFoliageSpeed;
		    uniform float _WindFoliageAmplitude;
            sampler2D _MainTex;
            float4 _MainTex_ST;
            SamplerState sampler_MainTex;
            uniform half _WorldYPosition;
            half _InnerAOAmount, _InnerAOLength, _InnerAOPower, _LightvectorX, _LightvectorY, _LightvectorZ, _BrightAmount, _BrightPower, _Cutoff;
            fixed4 _InnerAOColor, _MainColor, _SSSColor;

            float3 mod2D289( float3 x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }

		    float2 mod2D289( float2 x ) { return x - floor( x * ( 1.0 / 289.0 ) ) * 289.0; }

		    float3 permute( float3 x ) { return mod2D289( ( ( x * 34.0 ) + 1.0 ) * x ); }

		    float snoise( float2 v )
		    {
			    const float4 C = float4( 0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439 );
			    float2 i = floor( v + dot( v, C.yy ) );
			    float2 x0 = v - i + dot( i, C.xx );
			    float2 i1;
                i1 = ( x0.x > x0.y ) ? float2( 1.0, 0.0 ) : float2( 0.0, 1.0 );
                float4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod2D289( i );
                float3 p = permute( permute( i.y + float3( 0.0, i1.y, 1.0 ) ) + i.x + float3( 0.0, i1.x, 1.0 ) );
                float3 m = max( 0.5 - float3( dot( x0, x0 ), dot( x12.xy, x12.xy ), dot( x12.zw, x12.zw ) ), 0.0 );
                m = m * m;
                m = m * m;
                float3 x = 2.0 * frac( p * C.www ) - 1.0;
                float3 h = abs( x ) - 0.5;
                float3 ox = floor( x + 0.5 );
                float3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0 * a0 + h * h );
                float3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot( m, g );
		    }
            
            v2f vert (appdata v)
            {
                v2f o;
                float3 ase_worldPos = mul( unity_ObjectToWorld, v.vertex );
                float4 appendResult149 = (float4(ase_worldPos.x , ase_worldPos.y , ase_worldPos.z , 0.0));
                float2 panner93 = ( ( _Time.y * _WindFoliageSpeed ) * float2( 2,2 ) + appendResult149.xy);
                float simplePerlin2D101 = snoise( panner93 );
                float3 ase_vertexNormal = v.normal.xyz;
                v.vertex.xyz += ( float3( 0,0,0 ) + ( simplePerlin2D101 * _WindFoliageAmplitude * ase_vertexNormal * v.color.r ) );
                
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                //UNITY_TRANSFER_FOG(o,o.vertex);
                o.innerAo = (v.vertex.xyz - float3(0, _WorldYPosition, 0)) / _InnerAOLength;
                o.normalDir = normalize( mul( float4(v.normal, 0.0), unity_WorldToObject).xyz);
                float3 worldUnmapNormal = normalize(mul(unity_ObjectToWorld, v.vertex.xyz) - mul(unity_ObjectToWorld, float3(0, _WorldYPosition, 0)));
                o.unmapedNormal = worldUnmapNormal;
                return o;
            }



            fixed4 frag (v2f i) : SV_Target
            {
                // sample the texture
                float2 uv = i.uv.xy * _MainTex_ST.xy + _MainTex_ST.zw;
                fixed4 col = tex2D(_MainTex, uv) * _MainColor;
                float ndotl = dot(i.unmapedNormal, normalize(float3(_LightvectorX, _LightvectorY, _LightvectorZ)));
                float halfLambert = ndotl * 0.5 + 0.5;
                
                
                // apply fog
                //UNITY_APPLY_FOG(i.fogCoord, col);
                float3 occlusion = 1 - pow((cos(i.innerAo.x) * 0.5 + 0.5) * (cos(i.innerAo.y) * 0.5 + 0.5) * (cos(i.innerAo.z) * 0.5 + 0.5), _InnerAOPower) * (1 - _InnerAOColor);
                float3 fakeSSS = (pow(halfLambert, _BrightPower) + pow((1 - pow((cos(i.innerAo.x) * 0.5 + 0.5) * (cos(i.innerAo.y) * 0.5 + 0.5) * (cos(i.innerAo.z) * 0.5 + 0.5), _InnerAOPower)), _BrightPower)) * _SSSColor;
                col = (float4(col.rgb * (halfLambert + _BrightAmount * 0.1 + fakeSSS) * lerp(1, occlusion, _InnerAOAmount) * _BrightAmount, col.a) + col) * 0.5;
                clip(col.a - _Cutoff);
                return col;
            }
            ENDCG
        }
    }
}

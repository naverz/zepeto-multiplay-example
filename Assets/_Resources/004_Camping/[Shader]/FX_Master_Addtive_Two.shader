// Made with Amplify Shader Editor
// Available at the Unity Asset Store - http://u3d.as/y3X 
Shader "Particle/FX_Master_Addtive_Two"
{
	Properties
	{
		_Main_Texture("Main_Texture", 2D) = "white" {}
		_Main_U_Tiling("Main_U_Tiling", Float) = 1
		_Main_V_Tiling("Main_V_Tiling", Float) = 1
		_MainTex_U_Panning("MainTex_U_Panning", Float) = 0
		_MainTex_V_Panning("MainTex_V_Panning", Float) = 0
		_Distortion_Texture("Distortion_Texture", 2D) = "white" {}
		_Burn("Burn", Float) = 1
		_Distortion_Intensity("Distortion_Intensity", Float) = 0.2
		_Distortion_U_Panning("Distortion_U_Panning", Float) = 0
		_Distortion_V_Panning("Distortion_V_Panning", Float) = -0.2
		_Distortion_U_Tiling("Distortion_U_Tiling", Float) = 1
		_Distortion_V_Tiling("Distortion_V_Tiling", Float) = 1
		_Mask_Texture("Mask_Texture", 2D) = "white" {}
		_Dissolve("Dissolve", Float) = 1
		_Dissolve_Sharpness("Dissolve_Sharpness", Float) = 5.696
		[Toggle]_Use_CustomData("Use_CustomData", Float) = 0
		[HideInInspector] _texcoord( "", 2D ) = "white" {}
		[HideInInspector] _tex3coord3( "", 2D ) = "white" {}
		[HideInInspector] __dirty( "", Int ) = 1
	}

	SubShader
	{
		Tags{ "RenderType" = "Transparent"  "Queue" = "AlphaTest+0" "IsEmissive" = "true"  }
		Cull Off
		ZWrite Off
		Blend SrcAlpha One , SrcAlpha One
		
		CGPROGRAM
		#include "UnityShaderVariables.cginc"
		#pragma target 3.0
		#pragma surface surf Unlit keepalpha noshadow 
		#undef TRANSFORM_TEX
		#define TRANSFORM_TEX(tex,name) float4(tex.xy * name##_ST.xy + name##_ST.zw, tex.z, tex.w)
		struct Input
		{
			float3 uv3_tex3coord3;
			float2 uv_texcoord;
			float4 vertexColor : COLOR;
		};

		uniform float _Use_CustomData;
		uniform float _Burn;
		uniform sampler2D _Main_Texture;
		uniform sampler2D _Distortion_Texture;
		uniform float _Distortion_U_Tiling;
		uniform float _Distortion_V_Tiling;
		uniform float _Distortion_U_Panning;
		uniform float _Distortion_V_Panning;
		uniform float _Distortion_Intensity;
		uniform float _Main_U_Tiling;
		uniform float _Main_V_Tiling;
		uniform float _MainTex_U_Panning;
		uniform float _MainTex_V_Panning;
		uniform sampler2D _Mask_Texture;
		uniform float4 _Mask_Texture_ST;
		uniform float _Dissolve;
		uniform float _Dissolve_Sharpness;

		inline half4 LightingUnlit( SurfaceOutput s, half3 lightDir, half atten )
		{
			return half4 ( 0, 0, 0, s.Alpha );
		}

		void surf( Input i , inout SurfaceOutput o )
		{
			float4 appendResult84 = (float4(_Distortion_U_Tiling , _Distortion_V_Tiling , 0.0 , 0.0));
			float4 appendResult56 = (float4(_Distortion_U_Panning , _Distortion_V_Panning , 0.0 , 0.0));
			float2 panner45 = ( _Time.y * appendResult56.xy + float2( 0,0 ));
			float2 uv_TexCoord51 = i.uv_texcoord * appendResult84.xy + panner45;
			float4 appendResult87 = (float4(_Main_U_Tiling , _Main_V_Tiling , 0.0 , 0.0));
			float4 appendResult98 = (float4(_MainTex_U_Panning , _MainTex_V_Panning , 0.0 , 0.0));
			float2 panner99 = ( _Time.y * appendResult98.xy + float2( 0,0 ));
			float2 uv_TexCoord26 = i.uv_texcoord * appendResult87.xy + panner99;
			float4 tex2DNode25 = tex2D( _Main_Texture, ( ( UnpackNormal( tex2D( _Distortion_Texture, uv_TexCoord51 ) ) * lerp(_Distortion_Intensity,i.uv3_tex3coord3.y,_Use_CustomData) ) + float3( uv_TexCoord26 ,  0.0 ) ).xy );
			o.Emission = ( lerp(_Burn,i.uv3_tex3coord3.x,_Use_CustomData) * ( tex2DNode25 * i.vertexColor ) ).rgb;
			float2 uv_Mask_Texture = i.uv_texcoord * _Mask_Texture_ST.xy + _Mask_Texture_ST.zw;
			float4 tex2DNode100 = tex2D( _Mask_Texture, uv_Mask_Texture );
			float4 temp_output_108_0 = ( tex2DNode25 * tex2DNode100 );
			float4 temp_cast_7 = (_Dissolve_Sharpness).xxxx;
			float4 clampResult119 = clamp( ( temp_output_108_0 * pow( ( ( 0.5 * temp_output_108_0 ) + lerp(_Dissolve,i.uv3_tex3coord3.z,_Use_CustomData) ) , temp_cast_7 ) ) , float4( 0,0,0,0 ) , float4( 1,0,0,0 ) );
			o.Alpha = ( ( ( tex2DNode25.a * clampResult119 ) * i.vertexColor.a ) * tex2DNode100 ).r;
		}

		ENDCG
	}
	CustomEditor "ASEMaterialInspector"
}
/*ASEBEGIN
Version=17000
659.3334;135.3333;1658;1145;4213.636;762.5211;1.972019;True;True
Node;AmplifyShaderEditor.RangedFloatNode;34;-3581.056,-380.1262;Float;False;Property;_Distortion_U_Panning;Distortion_U_Panning;9;0;Create;True;0;0;False;0;0;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;31;-3581.056,-140.1262;Float;False;Property;_Distortion_V_Panning;Distortion_V_Panning;10;0;Create;True;0;0;False;0;-0.2;0.2;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleTimeNode;53;-3289.198,-20.01037;Float;False;1;0;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;82;-3314.373,-548.1838;Float;False;Property;_Distortion_V_Tiling;Distortion_V_Tiling;12;0;Create;True;0;0;False;0;1;0.5;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;81;-3320.644,-807.5228;Float;False;Property;_Distortion_U_Tiling;Distortion_U_Tiling;11;0;Create;True;0;0;False;0;1;1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.DynamicAppendNode;56;-3309.056,-268.1262;Float;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.DynamicAppendNode;84;-3078.153,-678.8557;Float;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.PannerNode;45;-3053.056,-188.1262;Float;False;3;0;FLOAT2;0,0;False;2;FLOAT2;0,0;False;1;FLOAT;1;False;1;FLOAT2;0
Node;AmplifyShaderEditor.RangedFloatNode;96;-3024.447,278.4252;Float;False;Property;_MainTex_U_Panning;MainTex_U_Panning;4;0;Create;True;0;0;False;0;0;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;95;-3032.477,385.9257;Float;False;Property;_MainTex_V_Panning;MainTex_V_Panning;5;0;Create;True;0;0;False;0;0;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;51;-2761.133,-463.6959;Float;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.DynamicAppendNode;98;-2760.477,302.0922;Float;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.SimpleTimeNode;97;-2740.619,550.2078;Float;False;1;0;FLOAT;1;False;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;122;-2967.041,-6.196185;Float;False;2;-1;3;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.RangedFloatNode;85;-2585.264,-31.58029;Float;False;Property;_Main_U_Tiling;Main_U_Tiling;2;0;Create;True;0;0;False;0;1;2.66;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;38;-2677.394,-194.1269;Float;False;Property;_Distortion_Intensity;Distortion_Intensity;8;0;Create;True;0;0;False;0;0.2;2.2;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;86;-2578.994,227.7587;Float;False;Property;_Main_V_Tiling;Main_V_Tiling;3;0;Create;True;0;0;False;0;1;0.42;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.PannerNode;99;-2504.477,382.0922;Float;False;3;0;FLOAT2;0,0;False;2;FLOAT2;0,0;False;1;FLOAT;1;False;1;FLOAT2;0
Node;AmplifyShaderEditor.SamplerNode;22;-2478.954,-407.8268;Float;True;Property;_Distortion_Texture;Distortion_Texture;6;0;Create;True;0;0;False;0;0bebe40e9ebbecc48b8e9cfea982da7e;5fccca4e447a7f943b67797f3c93cb53;True;0;True;white;Auto;True;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ToggleSwitchNode;123;-2376.06,-183.6621;Float;False;Property;_Use_CustomData;Use_CustomData;16;0;Create;True;0;0;False;0;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.DynamicAppendNode;87;-2342.775,97.08658;Float;False;FLOAT4;4;0;FLOAT;0;False;1;FLOAT;0;False;2;FLOAT;0;False;3;FLOAT;0;False;1;FLOAT4;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;121;-2087.471,-327.3004;Float;False;2;2;0;FLOAT3;0,0,0;False;1;FLOAT;0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;26;-2155.606,0.5081177;Float;False;0;-1;2;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT2;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleAddOpNode;24;-1807.387,53.86015;Float;False;2;2;0;FLOAT3;0,0,0;False;1;FLOAT2;0,0;False;1;FLOAT3;0
Node;AmplifyShaderEditor.SamplerNode;100;-3536.826,834.3309;Float;True;Property;_Mask_Texture;Mask_Texture;13;0;Create;True;0;0;False;0;5228a04ef529d2641937cab585cc1a02;ef9b974b01ffb2d47b6be11bc1940826;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SamplerNode;25;-1644.566,63.71509;Float;True;Property;_Main_Texture;Main_Texture;0;0;Create;True;0;0;False;0;9438e7af5347eaa448c6aad37f252544;ab21ae87b20e6374eb5854d3fcd386e0;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;108;-3198.004,872.9251;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;109;-3241.673,679.324;Float;False;Constant;_Float0;Float 0;15;0;Create;True;0;0;False;0;0.5;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;107;-3126.092,1097.02;Float;False;Property;_Dissolve;Dissolve;14;0;Create;True;0;0;False;0;1;0.95;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.ToggleSwitchNode;125;-2881.632,1041.475;Float;False;Property;_Use_CustomData;Use_CustomData;17;0;Create;True;0;0;False;0;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;110;-2920.679,863.3344;Float;False;2;2;0;FLOAT;0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleAddOpNode;111;-2614.269,771.8807;Float;True;2;2;0;COLOR;0,0,0,0;False;1;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;116;-2563.674,1094.46;Float;False;Property;_Dissolve_Sharpness;Dissolve_Sharpness;15;0;Create;True;0;0;False;0;5.696;3.44;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.PowerNode;115;-2288.289,727.2889;Float;False;2;0;COLOR;0,0,0,0;False;1;FLOAT;1;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;114;-1894.453,839.8241;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.ClampOpNode;119;-1627.621,625.3905;Float;False;3;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;2;COLOR;1,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;120;-1296.21,529.9896;Float;False;2;2;0;FLOAT;0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;79;-1299.473,-107.7421;Float;False;Property;_Burn;Burn;7;0;Create;True;0;0;False;0;1;12.1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.VertexColorNode;76;-1396.147,266.905;Float;False;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;78;-1122.521,318.7695;Float;False;2;2;0;COLOR;0,0,0,0;False;1;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;77;-1040.153,100.1131;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.ToggleSwitchNode;124;-1076.71,-86.34067;Float;False;Property;_Use_CustomData;Use_CustomData;16;0;Create;True;0;0;False;0;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;104;-817.5339,315.3332;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;80;-776.8698,-1.589161;Float;False;2;2;0;FLOAT;0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.StandardSurfaceOutputNode;75;-495.7512,91.84303;Float;False;True;2;Float;ASEMaterialInspector;0;0;Unlit;Particle/FX_Master_Addtive_Two;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;Off;2;False;-1;0;False;-1;False;0;False;-1;0;False;-1;False;0;Custom;0.5;True;False;0;True;Transparent;;AlphaTest;All;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;0;False;-1;False;0;False;-1;255;False;-1;255;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;False;2;15;10;25;False;0.5;False;8;5;False;-1;1;False;-1;8;5;False;-1;1;False;-1;0;False;-1;0;False;-1;0;False;0;0,0,0,0;VertexOffset;True;False;Cylindrical;False;Relative;0;;1;-1;-1;-1;0;False;0;0;False;-1;-1;0;False;-1;0;0;0;False;0.1;False;-1;0;False;-1;15;0;FLOAT3;0,0,0;False;1;FLOAT3;0,0,0;False;2;FLOAT3;0,0,0;False;3;FLOAT;0;False;4;FLOAT;0;False;6;FLOAT3;0,0,0;False;7;FLOAT3;0,0,0;False;8;FLOAT;0;False;9;FLOAT;0;False;10;FLOAT;0;False;13;FLOAT3;0,0,0;False;11;FLOAT3;0,0,0;False;12;FLOAT3;0,0,0;False;14;FLOAT4;0,0,0,0;False;15;FLOAT3;0,0,0;False;0
WireConnection;56;0;34;0
WireConnection;56;1;31;0
WireConnection;84;0;81;0
WireConnection;84;1;82;0
WireConnection;45;2;56;0
WireConnection;45;1;53;0
WireConnection;51;0;84;0
WireConnection;51;1;45;0
WireConnection;98;0;96;0
WireConnection;98;1;95;0
WireConnection;99;2;98;0
WireConnection;99;1;97;0
WireConnection;22;1;51;0
WireConnection;123;0;38;0
WireConnection;123;1;122;2
WireConnection;87;0;85;0
WireConnection;87;1;86;0
WireConnection;121;0;22;0
WireConnection;121;1;123;0
WireConnection;26;0;87;0
WireConnection;26;1;99;0
WireConnection;24;0;121;0
WireConnection;24;1;26;0
WireConnection;25;1;24;0
WireConnection;108;0;25;0
WireConnection;108;1;100;0
WireConnection;125;0;107;0
WireConnection;125;1;122;3
WireConnection;110;0;109;0
WireConnection;110;1;108;0
WireConnection;111;0;110;0
WireConnection;111;1;125;0
WireConnection;115;0;111;0
WireConnection;115;1;116;0
WireConnection;114;0;108;0
WireConnection;114;1;115;0
WireConnection;119;0;114;0
WireConnection;120;0;25;4
WireConnection;120;1;119;0
WireConnection;78;0;120;0
WireConnection;78;1;76;4
WireConnection;77;0;25;0
WireConnection;77;1;76;0
WireConnection;124;0;79;0
WireConnection;124;1;122;1
WireConnection;104;0;78;0
WireConnection;104;1;100;0
WireConnection;80;0;124;0
WireConnection;80;1;77;0
WireConnection;75;2;80;0
WireConnection;75;9;104;0
ASEEND*/
//CHKSM=D731F7509039FF05FCAF19AAAC28FAAF15183E4C
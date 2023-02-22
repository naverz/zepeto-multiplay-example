#ifndef __COLOR_GRADING__
#define __COLOR_GRADING__



// POST PROCESSING PARAMTERS
static const float _ExposureEV = 1.319508;
static const half3 _LogLut_Params = half3(0.0009765625,0.03125,31);
sampler2D _LogLut;


struct ParamsLogC
{
    half cut;
    half a, b, c, d, e, f;
};

static const ParamsLogC LogC =
{
    0.011361, // cut
    5.555556, // a
    0.047996, // b
    0.244161, // c
    0.386036, // d
    5.301883, // e
    0.092819  // f
};





half3 ApplyLut2d(sampler2D tex, half3 uvw, half3 scaleOffset)
{
    // Strip format where `height = sqrt(width)`
    uvw.z *= scaleOffset.z;
    half shift = floor(uvw.z);

    uvw.xy = uvw.xy * scaleOffset.z * scaleOffset.xy + scaleOffset.xy * 0.5;
    uvw.x += shift * scaleOffset.y;
    uvw.xyz = lerp(tex2D(tex, uvw.xy).rgb, tex2D(tex, uvw.xy + half2(scaleOffset.y, 0)).rgb, uvw.z - shift);


    return uvw;
}
half3 LinearToLogC(half3 x)
{
    return LogC.c * log10(LogC.a * x + LogC.b) + LogC.d;
}

half4 ApplyColorGrading(half4 outputColor) {



	// Gamma space... Gah.
	#if UNITY_COLORSPACE_GAMMA
	{
	    outputColor.rgb = GammaToLinearSpace(outputColor.rgb);
	}
	#endif


    outputColor.rgb *= _ExposureEV; // Exposure is in ev units (or 'stops')

    half3 colorLogC = saturate(LinearToLogC(outputColor.rgb));
    outputColor.rgb = ApplyLut2d(_LogLut, colorLogC, _LogLut_Params);

    outputColor.rgb = saturate(outputColor.rgb);

    // Back to gamma space if needed
    #if UNITY_COLORSPACE_GAMMA
    {
        outputColor.rgb = LinearToGammaSpace(outputColor.rgb);
    }
    #endif
    return outputColor;
}

#endif // __COLOR_GRADING__

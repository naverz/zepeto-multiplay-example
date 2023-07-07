using System.Collections;
using System.IO;
using System.Net;
using UnityEditor;
using UnityEngine;

public class ImportHandler
{
    public static IEnumerator ImportPackage(string title, string version)
    {
        string downloadUrl = Path.Combine(ConstantManager.DOWNLOAD_PATH, title,
            version + ConstantManager.EXTENSION_UNITYPACKAGE);
        Debug.Log(downloadUrl);

        string tempFilePath = Path.Combine(Application.temporaryCachePath, title + ConstantManager.EXTENSION_UNITYPACKAGE);

        using (var webClient = new WebClient())
        {
            webClient.DownloadProgressChanged += (sender, e) =>
            {
                float progress = (float)e.BytesReceived / (float)e.TotalBytesToReceive;
                EditorUtility.DisplayProgressBar("Downloading Package", $"{(progress * 100f):F1}%", progress);
            };

            webClient.DownloadFileCompleted += (sender, e) =>
            {
                EditorUtility.ClearProgressBar();
                AssetDatabase.ImportPackage(tempFilePath, true);
                File.Delete(tempFilePath);
            };

            yield return webClient.DownloadFileTaskAsync(downloadUrl, tempFilePath);
        }
    }
}
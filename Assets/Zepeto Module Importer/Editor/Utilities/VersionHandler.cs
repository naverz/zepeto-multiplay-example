
using System;
using System.Reflection;

public class VersionHandler
{
    public static string VersionCheck(string className)
    {
        string downloadedVersion = "UNKNOWN";

        Type type = GetTypeByName(className);

        if (type != null)
        {
            FieldInfo field = type.GetField("VERSION", BindingFlags.Static | BindingFlags.Public);

            if (field != null)
            {
                downloadedVersion = (string)field.GetValue(null);
            }
        }

        return downloadedVersion;
    }
    
    private static Type GetTypeByName(string className)
    {
        Assembly[] assemblies = AppDomain.CurrentDomain.GetAssemblies();
        foreach (Assembly assembly in assemblies)
        {
            Type type = assembly.GetType(className);
            if (type != null)
            {
                return type;
            }
        }

        return null;
    }
}

## Build Failure Issue

### Description
There is a build failure caused by a missing reference to 'songInformationService'. The error message encountered is:

```
TS2304: Cannot find name 'songInformationService'
```

This error occurred during the build step in the GitHub Actions workflow. You can view the logs [here](https://github.com/kmkarakaya/TangoTales/actions/runs/18205897426/job/51836100826#step:3:69).

### Suggested Resolution
- Check for the missing import or definition of 'songInformationService' around lines 565-566.
- If the service is needed, please import or define it accordingly.
- If the service is not needed, consider removing the reference to it.

### Impact
This issue is blocking successful CI/CD builds, so it is important to resolve it promptly.
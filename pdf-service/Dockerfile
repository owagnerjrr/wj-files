# Full engine: Office conversion, OCR, compression and advanced PDF editing.
# Version pinned for reviewable upgrades. Upstream licenses remain in the image.
FROM docker.stirlingpdf.com/stirlingtools/stirling-pdf:3.2.0
COPY --chown=1000:1000 settings.yml /configs/settings.yml
COPY --chown=1000:1000 customFiles/ /customFiles/
ENV SECURITY_ENABLELOGIN=false \
    SYSTEM_SHOWSETTINGSWHENNOLOGIN=false \
    SYSTEM_DEFAULTLOCALE=pt-BR \
    SYSTEM_ENABLEANALYTICS=false \
    SYSTEM_ENABLEPOSTHOG=false \
    SYSTEM_ENABLESCARF=false \
    STORAGE_ENABLED=false \
    UI_APPNAMENAVBAR="WJ PDF" \
    TZ=America/Sao_Paulo
EXPOSE 8080

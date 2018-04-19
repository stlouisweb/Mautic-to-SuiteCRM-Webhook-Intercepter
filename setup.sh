#!/usr/bin/env bash

echo "Configure API settings"

echo -n "Mautic URL: "
read MAUTIC_URL

echo -n "Mautic Username: "
read MAUTIC_USERNAME

echo -n "Mautic Password: "
read MAUTIC_PASSWORD

echo -n "SuiteCRM URL: "
read SUITECRM_URL

echo -n "SuiteCRM Username: "
read SUITECRM_USERNAME

echo -n "SuiteCRM Password: "
read SUITECRM_PASSWORD

echo -n "Archive Junk SuiteCRM Leads (y/n): "
read ARCHIVE_JUNK_LEADS

cat > "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)/settings.conf" << EOF1
#!/usr/bin/env bash

export MAUTIC_URL=${MAUTIC_URL}
export MAUTIC_USERNAME=${MAUTIC_USERNAME}
export MAUTIC_PASSWORD=${MAUTIC_PASSWORD}
export SUITECRM_URL=${SUITECRM_URL}
export SUITECRM_USERNAME=${SUITECRM_USERNAME}
export SUITECRM_PASSWORD=${SUITECRM_PASSWORD}
export ARCHIVE_JUNK_LEADS=${ARCHIVE_JUNK_LEADS}

EOF1

source "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)/settings.conf"

echo "Configured Settings."

exit 0

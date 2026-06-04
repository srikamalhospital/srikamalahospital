import { useEffect, useState } from 'react';
import { getConfig } from '../utils/api';
import { SITE_URL, SITE_DOMAIN, SITE_EMAIL } from '../config/site';

const DEFAULTS = {
  showCoreServices: true,
  showHealthAwareness: true,
  allowOnlinePayment: true,
  hospitalPhone: '99480 76665',
  diagnosticsPhone: '98668 95634',
  opTimings: 'Open 24 Hours',
  hospitalAddress: 'SRI KAMALA HOSPITAL, M.G. Road, Suryapet, Telangana 508213',
  websiteUrl: SITE_URL,
  websiteDomain: SITE_DOMAIN,
  contactEmail: SITE_EMAIL,
};

export default function useSiteConfig() {
  const [config, setConfig] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await getConfig();
        if (mounted && resp.data?.success && resp.data.config) {
          setConfig({ ...DEFAULTS, ...resp.data.config });
        }
      } catch {
        /* use defaults */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const hospitalTel = `tel:+91${String(config.hospitalPhone).replace(/\D/g, '').slice(-10)}`;
  const diagnosticsTel = `tel:+91${String(config.diagnosticsPhone).replace(/\D/g, '').slice(-10)}`;

  return { config, loading, hospitalTel, diagnosticsTel };
}

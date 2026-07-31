import { useEffect, useState } from 'react';
import { getConfig } from '../utils/api';
import { SITE_URL, SITE_DOMAIN, SITE_EMAIL } from '../config/site';
import {
  ENC_HOSPITAL,
  ENC_LAB,
  decodePhone,
  maskPhone,
  buildTelHref,
  dialPhone,
} from '../utils/phoneProtect';

const DEFAULTS = {
  showCoreServices: true,
  showHealthAwareness: true,
  allowOnlinePayment: true,
  // Encoded tokens — resolved only for dialing / admin edit forms
  hospitalPhone: decodePhone(ENC_HOSPITAL),
  diagnosticsPhone: decodePhone(ENC_LAB),
  opTimings: 'Open 24 Hours',
  hospitalAddress: 'SRI KAMALA HOSPITAL, Manasa Nagar, Suryapet, Telangana 508213, India',
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

  const hospitalPhoneMasked = maskPhone(config.hospitalPhone);
  const diagnosticsPhoneMasked = maskPhone(config.diagnosticsPhone);

  /** Prefer these for UI display — never show raw digits publicly. */
  const hospitalTel = buildTelHref(config.hospitalPhone); // kept for legacy; prefer dialHospital()
  const diagnosticsTel = buildTelHref(config.diagnosticsPhone);

  const dialHospital = () => dialPhone(config.hospitalPhone);
  const dialDiagnostics = () => dialPhone(config.diagnosticsPhone);

  return {
    config,
    loading,
    hospitalTel,
    diagnosticsTel,
    hospitalPhoneMasked,
    diagnosticsPhoneMasked,
    dialHospital,
    dialDiagnostics,
  };
}
